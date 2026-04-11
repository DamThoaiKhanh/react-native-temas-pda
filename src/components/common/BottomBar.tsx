import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from "react-native";

import { ScreenItem } from "../utils";
import { useRef, useState } from "react";

const BottomBar = ({
  tabs,
  selectedIndex,
  onSelect,
  bottomInset,
}: {
  tabs: ScreenItem[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  bottomInset: number;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const handleScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setCanLeft(contentOffset.x > 2);
    setCanRight(
      contentOffset.x < contentSize.width - layoutMeasurement.width - 2,
    );
  };

  return (
    <View style={[styles.barContainer, { paddingBottom: bottomInset }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.barContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {tabs.map((tab, i) => {
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.tabItem, isSelected && styles.tabItemSelected]}
              onPress={() => onSelect(i)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: isSelected ? 35 : 30,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {tab.icon}
              </Text>
              {isSelected && <Text style={styles.tabLabel}>{tab.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {canLeft && (
        <TouchableOpacity style={[styles.arrow, styles.arrowLeft]}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
      )}
      {canRight && (
        <TouchableOpacity style={[styles.arrow, styles.arrowRight]}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  barContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  tabItemSelected: { backgroundColor: "rgba(21,101,192,0.12)" },
  tabLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565C0",
    marginLeft: 6,
  },
  arrow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowLeft: { left: 0, backgroundColor: "rgba(255,255,255,0.9)" },
  arrowRight: { right: 0, backgroundColor: "rgba(255,255,255,0.9)" },
  arrowText: {
    fontSize: 26,
    color: "rgba(0,0,0,0.4)",
    fontWeight: "bold",
  },
});

export default BottomBar;
