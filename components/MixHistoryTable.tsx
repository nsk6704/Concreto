import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { ChevronRight } from 'lucide-react-native';

export interface MixHistoryItem {
  date: string;
  cement: string;
  slump: string;
  id: string;
}

interface MixHistoryTableProps {
  data: MixHistoryItem[];
  onRowPress?: (id: string) => void;
}

const MixHistoryTable = ({ data, onRowPress }: MixHistoryTableProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Cement</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Slump</Text>
        {onRowPress && <View style={{ width: 24 }} />}
      </View>
      <ScrollView style={styles.tableBody}>
        {data.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.dataRow,
              pressed && styles.pressedRow,
              onRowPress && styles.clickableRow,
            ]}
            onPress={() => onRowPress && onRowPress(item.id)}
          >
            <Text style={[styles.dataCell, { flex: 1 }]}>{item.date}</Text>
            <Text style={[styles.dataCell, { flex: 1 }]}>{item.cement}</Text>
            <Text style={[styles.dataCell, { flex: 1 }]}>{item.slump}</Text>
            {onRowPress && (
              <ChevronRight size={18} color={COLORS.darkGray} style={styles.chevron} />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  tableBody: {
    maxHeight: 250,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dataCell: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  pressedRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  clickableRow: {
    paddingRight: 8,
  },
  chevron: {
    width: 24,
    alignItems: 'center',
  },
});

export default MixHistoryTable;