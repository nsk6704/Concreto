import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mixData, setMixData] = useState([]);

  // For charts
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    cement: [30, 32, 35, 40, 38, 35, 35],
    sand: [45, 45, 42, 40, 42, 45, 45],
    water: [25, 23, 23, 20, 20, 20, 20],
    temperature: [30, 31, 32, 33, 31, 30, 29],
  });

  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Use a simpler query that doesn't require an index
        const db = getFirestore();
        const mixesCollection = collection(db, 'mixHistory');
        const snapshot = await getDocs(mixesCollection);

        // Filter client-side instead of in the query
        const history = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          }))
          .filter((doc) => doc.userId === user.uid)
          .sort((a, b) => b.date - a.date); // Sort by date, newest first

        setMixData(history);

        // Generate chart data if we have history
        if (history.length > 0) {
          // Get last 7 mixes or fewer if we don't have 7
          const recentMixes = history.slice(0, Math.min(7, history.length));

          const labels = recentMixes
            .map((mix) =>
              new Date(mix.date).toLocaleDateString('en-US', {
                weekday: 'short',
              })
            )
            .reverse();

          const cement = recentMixes.map((mix) => mix.cement || 35).reverse();
          const sand = recentMixes.map((mix) => mix.sand || 45).reverse();
          const water = recentMixes.map((mix) => mix.water || 20).reverse();
          const temperature = recentMixes
            .map((mix) => mix.temperature || 30)
            .reverse();

          setChartData({ labels, cement, sand, water, temperature });
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryYellow} />
        <Text style={styles.loadingText}>Analyzing your mix data...</Text>
      </View>
    );
  }

  // Calculate recommendations based on mix data
  const getRecommendation = () => {
    if (!mixData || mixData.length === 0) {
      return {
        recommended: { cement: 35, sand: 45, water: 20 },
        message: 'Standard mix recommended for beginners.',
      };
    }

    // Simple recommendation logic
    const recentMix = mixData[0];

    if (recentMix.cement > 40) {
      return {
        recommended: { cement: 40, sand: 45, water: 15 },
        message: 'High strength mix recommended based on your history.',
      };
    } else if (recentMix.water > 25) {
      return {
        recommended: { cement: 35, sand: 45, water: 20 },
        message: 'Consider reducing water content for better strength.',
      };
    }

    return {
      recommended: { cement: 35, sand: 45, water: 20 },
      message: 'Standard mix recommended based on your history.',
    };
  };

  const recommendation = getRecommendation();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Mix Analytics</Text>

      <View style={styles.recommendationCard}>
        <Text style={styles.cardTitle}>Recommended Mix</Text>
        <Text style={styles.recommendationText}>{recommendation.message}</Text>
        <View style={styles.recommendedValues}>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Cement</Text>
            <Text style={styles.valueNumber}>
              {recommendation.recommended.cement}%
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Sand</Text>
            <Text style={styles.valueNumber}>
              {recommendation.recommended.sand}%
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Water</Text>
            <Text style={styles.valueNumber}>
              {recommendation.recommended.water}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mix Composition History</Text>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [
              {
                data: chartData.cement,
                color: () => COLORS.primaryYellow,
                strokeWidth: 2,
              },
              {
                data: chartData.sand,
                color: () => COLORS.blue,
                strokeWidth: 2,
              },
              {
                data: chartData.water,
                color: () => COLORS.success,
                strokeWidth: 2,
              },
            ],
            legend: ['Cement', 'Sand', 'Water'],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.white,
            backgroundGradientFrom: COLORS.white,
            backgroundGradientTo: COLORS.white,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => COLORS.darkGray,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
          fromZero
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperature Trends</Text>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{ data: chartData.temperature }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.white,
            backgroundGradientFrom: COLORS.white,
            backgroundGradientTo: COLORS.white,
            decimalPlaces: 0,
            color: () => COLORS.error,
            labelColor: () => COLORS.darkGray,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: COLORS.darkGray,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mixData.length || 0}</Text>
            <Text style={styles.statLabel}>Total Mixes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(
                mixData.reduce((acc, mix) => acc + (mix.cement || 0), 0) /
                  (mixData.length || 1)
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Avg. Cement</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(
                mixData.reduce((acc, mix) => acc + (mix.water || 0), 0) /
                  (mixData.length || 1)
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Avg. Water</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
  },
  headerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryYellow,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 20,
  },
  recommendationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  recommendedValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  valueItem: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  valueNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.primaryYellow,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.blue,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
});
