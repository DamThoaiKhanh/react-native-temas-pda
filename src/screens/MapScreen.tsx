import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PanResponder,
  Dimensions,
} from "react-native";
import Svg, {
  Line,
  Circle,
  Path,
  Text as SvgText,
  G,
  Polygon,
} from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import useRobotStore from "../stores/useRobotStore";
import useWsStore, { WsCommands } from "../stores/useWsStore";
import { HeaderBar } from "@/components/common/HeaderBar";
import { getServerConfig, getUser } from "../services/storageService";
import { commonStyles } from "@/styles/commonStyles";

interface SMapPoint {
  x: number;
  y: number;
}
interface SMapHeader {
  mapType: string;
  mapName: string;
  minPos: SMapPoint;
  maxPos: SMapPoint;
  resolution: number;
  version: string;
}
interface SMapAdvancedPoint {
  instanceName: string;
  instanceId: string;
  pos: SMapPoint;
  ignoreDir: boolean;
}
interface SMapRouteEndpoint {
  pos: SMapPoint;
}
interface SMapRoute {
  startPos: SMapRouteEndpoint;
  endPos: SMapRouteEndpoint;
  controlPos1?: SMapPoint;
  controlPos2?: SMapPoint;
}
interface SMapData {
  header: SMapHeader;
  normalPosList: SMapPoint[];
  advancedPointList: SMapAdvancedPoint[];
  advancedRouteList: SMapRoute[];
}

function parseMapData(json: any): SMapData {
  const pt = (j: any): SMapPoint => ({
    x: Number(j?.x ?? 0),
    y: Number(j?.y ?? 0),
  });
  return {
    header: {
      mapType: String(json.header?.mapType ?? ""),
      mapName: String(json.header?.mapName ?? ""),
      minPos: pt(json.header?.minPos),
      maxPos: pt(json.header?.maxPos),
      resolution: Number(json.header?.resolution ?? 0),
      version: String(json.header?.version ?? ""),
    },
    normalPosList: (json.normalPosList ?? []).map((p: any) => pt(p)),
    advancedPointList: (json.advancedPointList ?? []).map((p: any) => ({
      instanceName: p.instanceName ?? "",
      instanceId: p.instanceId ?? "",
      pos: pt(p.pos),
      ignoreDir: Boolean(p.ignoreDir),
    })),
    advancedRouteList: (json.advancedRouteList ?? []).map((r: any) => ({
      startPos: { pos: pt(r.startPos?.pos) },
      endPos: { pos: pt(r.endPos?.pos) },
      controlPos1: r.controlPos1?.x != null ? pt(r.controlPos1) : undefined,
      controlPos2: r.controlPos2?.x != null ? pt(r.controlPos2) : undefined,
    })),
  };
}

function makeViewport(
  mapData: SMapData,
  width: number,
  height: number,
  padding = 24,
) {
  const { minPos, maxPos } = mapData.header;
  const usableW = Math.max(1, width - padding * 2);
  const usableH = Math.max(1, height - padding * 2);
  const mapW = Math.max(0.0001, maxPos.x - minPos.x);
  const mapH = Math.max(0.0001, maxPos.y - minPos.y);
  const scale = Math.min(usableW / mapW, usableH / mapH);
  const drawnW = mapW * scale;
  const drawnH = mapH * scale;
  const offX = (width - drawnW) / 2;
  const offY = (height - drawnH) / 2;
  const toScreen = (x: number, y: number) => ({
    sx: offX + (x - minPos.x) * scale,
    sy: offY + (maxPos.y - y) * scale,
  });
  return { scale, toScreen };
}

function dist(t: any[]) {
  const dx = t[0].pageX - t[1].pageX;
  const dy = t[0].pageY - t[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function midpoint(t: any[]) {
  return { x: (t[0].pageX + t[1].pageX) / 2, y: (t[0].pageY + t[1].pageY) / 2 };
}

const clampScale = (s: number) => Math.min(Math.max(s, 0.3), 8.0);

// MapScreen
export function MapScreen() {
  const navigation = useNavigation<any>();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const prevIndex = useNavStore((s) => s.previousIndex);

  const { robots, fetchRobots } = useRobotStore();
  const { robotPoses, sendCommand, connectionState } = useWsStore();

  const [mapData, setMapData] = useState<SMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [, forceUpdate] = useState(0);

  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const svgRef = useRef<any>(null);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);
  const isPinching = useRef(false);

  const pollingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width: screenW } = Dimensions.get("window");
  const [mapHeight, setMapHeight] = useState(480);

  const applyTransform = useCallback(() => {
    svgRef.current?.setNativeProps?.({
      style: {
        transform: [
          { translateX: txRef.current },
          { translateY: tyRef.current },
          { scale: scaleRef.current },
        ],
      },
    });
  }, []);

  const commitTransform = useCallback(() => forceUpdate((n) => n + 1), []);

  const fetchMapData = useCallback(async () => {
    setIsLoading(true);
    setMapError(null);
    try {
      const serverConfig = await getServerConfig();
      const user = await getUser();
      if (!serverConfig) throw new Error("Server config not found");
      const baseUrl = `http://${serverConfig.ipAddress}:${serverConfig.port}`;
      const res = await fetch(`${baseUrl}/api/v1/core/current-map`, {
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Failed to load map (${res.status})`);
      const json = await res.json();
      setMapData(parseMapData(json.data.mapData));
    } catch (e: any) {
      setMapError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navIndex === NavIndex.MapScreen && prevIndex !== NavIndex.MapScreen) {
      fetchRobots();
      fetchMapData();
    }
  }, [navIndex]);

  useEffect(() => {
    if (navIndex === NavIndex.MapScreen) {
      pollingTimer.current = setInterval(
        () => sendCommand(WsCommands.getRobotListStatus),
        1000,
      );
    }
    return () => {
      if (pollingTimer.current) clearInterval(pollingTimer.current);
    };
  }, [navIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          lastPinchDist.current = dist(touches);
        } else {
          isPinching.current = false;
          lastPanPos.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          };
        }
      },

      onPanResponderMove: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          const newDist = dist(touches);
          const mid = midpoint(touches);
          if (lastPinchDist.current > 0) {
            const ratio = newDist / lastPinchDist.current;
            const newScale = clampScale(scaleRef.current * ratio);
            const effRatio = newScale / scaleRef.current;
            txRef.current = mid.x - effRatio * (mid.x - txRef.current);
            tyRef.current = mid.y - effRatio * (mid.y - tyRef.current);
            scaleRef.current = newScale;
          }
          lastPinchDist.current = newDist;
          applyTransform();
        } else if (!isPinching.current) {
          const dx = e.nativeEvent.pageX - lastPanPos.current.x;
          const dy = e.nativeEvent.pageY - lastPanPos.current.y;
          lastPanPos.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          };
          txRef.current += dx;
          tyRef.current += dy;
          applyTransform();
        }
      },

      onPanResponderRelease: () => {
        isPinching.current = false;
        lastPinchDist.current = 0;
        commitTransform();
      },

      onPanResponderTerminate: () => {
        isPinching.current = false;
        lastPinchDist.current = 0;
      },
    }),
  ).current;

  const zoomIn = () => {
    const cx = screenW / 2;
    const cy = mapHeight / 2;
    const newScale = clampScale(scaleRef.current * 1.3);
    const ratio = newScale / scaleRef.current;
    txRef.current = cx - ratio * (cx - txRef.current);
    tyRef.current = cy - ratio * (cy - tyRef.current);
    scaleRef.current = newScale;
    commitTransform();
  };

  const zoomOut = () => {
    const cx = screenW / 2;
    const cy = mapHeight / 2;
    const newScale = clampScale(scaleRef.current / 1.3);
    const ratio = newScale / scaleRef.current;
    txRef.current = cx - ratio * (cx - txRef.current);
    tyRef.current = cy - ratio * (cy - tyRef.current);
    scaleRef.current = newScale;
    commitTransform();
  };

  const fitView = () => {
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
    commitTransform();
  };

  const renderMapContent = () => {
    if (!mapData) return null;
    const vp = makeViewport(mapData, screenW, mapHeight);
    return (
      <>
        {mapData.advancedRouteList.map((route, i) => {
          const start = vp.toScreen(route.startPos.pos.x, route.startPos.pos.y);
          const end = vp.toScreen(route.endPos.pos.x, route.endPos.pos.y);
          if (route.controlPos1 && route.controlPos2) {
            const c1 = vp.toScreen(route.controlPos1.x, route.controlPos1.y);
            const c2 = vp.toScreen(route.controlPos2.x, route.controlPos2.y);
            return (
              <Path
                key={`r${i}`}
                d={`M${start.sx} ${start.sy}C${c1.sx} ${c1.sy} ${c2.sx} ${c2.sy} ${end.sx} ${end.sy}`}
                stroke="#444"
                strokeWidth="1.5"
                fill="none"
              />
            );
          }
          if (route.controlPos1) {
            const c1 = vp.toScreen(route.controlPos1.x, route.controlPos1.y);
            return (
              <Path
                key={`r${i}`}
                d={`M${start.sx} ${start.sy}Q${c1.sx} ${c1.sy} ${end.sx} ${end.sy}`}
                stroke="#444"
                strokeWidth="1.5"
                fill="none"
              />
            );
          }
          return (
            <Line
              key={`r${i}`}
              x1={start.sx}
              y1={start.sy}
              x2={end.sx}
              y2={end.sy}
              stroke="#444"
              strokeWidth="1.5"
            />
          );
        })}

        {mapData.normalPosList
          .filter((_, i) => i % 3 === 0)
          .map((pt, i) => {
            const { sx, sy } = vp.toScreen(pt.x, pt.y);
            return (
              <Circle
                key={`n${i}`}
                cx={sx}
                cy={sy}
                r={1}
                fill="rgba(0,0,0,0.5)"
              />
            );
          })}

        {mapData.advancedPointList.map((pt, i) => {
          const { sx, sy } = vp.toScreen(pt.pos.x, pt.pos.y);
          return (
            <G key={`a${i}`}>
              <Circle cx={sx} cy={sy} r={5} fill="#F44336" />
              <Circle
                cx={sx}
                cy={sy}
                r={5}
                stroke="white"
                strokeWidth="1"
                fill="none"
              />
              <SvgText
                x={sx}
                y={sy + 14}
                textAnchor="middle"
                fontSize="8"
                fill="#1565C0"
                fontWeight="600"
              >
                {pt.instanceName}
              </SvgText>
            </G>
          );
        })}

        {robots.map((robot) => {
          const pose = robotPoses[robot.id];
          if (!pose) return null;
          const { sx, sy } = vp.toScreen(pose.x, pose.y);
          const online = pose.online;
          const bodyColor = online ? "#E83E9C" : "#9E9E9E";
          const labelColor = online ? "#2E7D32" : "#9E9E9E";
          const R = 8;
          const theta = -(pose.theta ?? 0);
          const tip = {
            x: sx + Math.cos(theta) * R * 1.8,
            y: sy + Math.sin(theta) * R * 1.8,
          };
          const left = {
            x: sx + Math.cos(theta + 2.4) * R,
            y: sy + Math.sin(theta + 2.4) * R,
          };
          const right = {
            x: sx + Math.cos(theta - 2.4) * R,
            y: sy + Math.sin(theta - 2.4) * R,
          };
          return (
            <G key={`robot-${robot.id}`}>
              <Circle cx={sx} cy={sy} r={R} fill={bodyColor} opacity={0.9} />
              <Circle
                cx={sx}
                cy={sy}
                r={R}
                stroke="black"
                strokeWidth="0.6"
                fill="none"
              />
              <Polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill={online ? "#69F0AE" : "#bbb"}
                opacity={0.9}
              />
              <SvgText
                x={sx}
                y={sy + R + 9}
                textAnchor="middle"
                fontSize="7"
                fill={labelColor}
                fontWeight="bold"
              >
                {robot.id}
              </SvgText>
              <SvgText
                x={sx}
                y={sy + R + 17}
                textAnchor="middle"
                fontSize="6"
                fill={labelColor}
              >
                {robot.name}
              </SvgText>
            </G>
          );
        })}
      </>
    );
  };

  const statusText = isLoading
    ? "Loading map..."
    : mapError
      ? `Error: ${mapError}`
      : `Map: ${mapData?.header.mapName ?? "-"} • Robots: ${robots.length} • Live: ${Object.keys(robotPoses).length} • WS: ${connectionState}`;

  return (
    <View style={commonStyles.container}>
      <HeaderBar
        title="Map"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />

      {/* ── Outer container — position relative so overlays work ── */}
      <View
        style={commonStyles.container}
        onLayout={(e) => setMapHeight(e.nativeEvent.layout.height)}
      >
        {/* Map canvas */}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
          {isLoading && !mapData && (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          )}
          {mapError && !mapData && <Text style={s.errorText}>{mapError}</Text>}
          {!mapData && !isLoading && !mapError && (
            <Text style={s.infoText}>Tap ↺ to load map</Text>
          )}

          {mapData && (
            <Svg
              ref={svgRef}
              width={screenW}
              height={mapHeight}
              style={{
                transform: [
                  { translateX: txRef.current },
                  { translateY: tyRef.current },
                  { scale: scaleRef.current },
                ],
              }}
            >
              {renderMapContent()}
            </Svg>
          )}
        </View>

        {/* ── Controls overlay — outside panResponder, receives touches freely ── */}
        <View style={s.controls} pointerEvents="box-none">
          {[
            {
              icon: <AntDesign name="plus" size={18} color="white" />,
              onPress: zoomIn,
            },
            {
              icon: <AntDesign name="minus" size={18} color="white" />,
              onPress: zoomOut,
            },
            {
              icon: <AntDesign name="fullscreen" size={18} color="white" />,
              onPress: fitView,
            },
            {
              icon: (
                <FontAwesome5
                  name={showStatus ? "eye" : "eye-slash"}
                  size={18}
                  color="white"
                />
              ),
              onPress: () => setShowStatus((v) => !v),
            },
            {
              icon: <AntDesign name="profile" size={18} color="white" />,
              onPress: () => setShowLegend((v) => !v),
            },
          ].map((btn, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.controlBtn}
                onPress={btn.onPress}
                activeOpacity={0.7}
              >
                {btn.icon}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
        {/* Status card */}
        {showStatus && (
          <View style={s.statusCard} pointerEvents="none">
            <Text style={s.statusText} numberOfLines={2}>
              {statusText}
            </Text>
          </View>
        )}
        {/* Legend */}
        {showLegend && (
          <View style={s.legendCard} pointerEvents="none">
            <Text style={s.legendTitle}>📌 Legend</Text>
            <LegendLine color="#444" label="Route" />
            <LegendDot color="#F44336" label="Traffic point" />
            <LegendDot color="rgba(0,0,0,0.5)" label="Map points" />
            <LegendDot color="#E83E9C" label="Robot online" />
            <LegendDot color="#9E9E9E" label="Robot offline" />
          </View>
        )}
      </View>

      {/* Floating point button */}
      <TouchableOpacity
        style={s.floatingActionBtn}
        onPress={async () => {
          await fetchRobots();
          await fetchMapData();
          sendCommand(WsCommands.getRobotListStatus);
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="refresh-outline" size={30} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 6,
        }}
      />
      <Text style={{ fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
    >
      <View
        style={{ width: 16, height: 2, backgroundColor: color, marginRight: 6 }}
      />
      <Text style={{ fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 40,
    paddingHorizontal: 24,
  },
  infoText: { textAlign: "center", color: "#888", marginTop: 40 },
  controls: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(80,80,80,0.75)",
    borderRadius: 8,
    overflow: "hidden",
  },
  controlBtn: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: { fontSize: 18, color: "#fff" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  statusCard: {
    position: "absolute",
    top: 8,
    left: 58,
    right: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 8,
  },
  statusText: { fontSize: 11, color: "#333" },
  legendCard: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  legendTitle: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  floatingActionBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

export default MapScreen;
