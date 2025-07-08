import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import MixHistoryTable, { MixHistoryItem } from '@/components/MixHistoryTable';
import PrimaryButton from '@/components/PrimaryButton';
import { CircleArrowLeft as ArrowLeftCircle } from 'lucide-react-native';
import { getUserMixHistory } from '@/utils/mixHistoryService';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mixData, setMixData] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'history'
  const [selectedMixId, setSelectedMixId] = useState(null);
  const [mixHistory, setMixHistory] = useState([]);

  // For charts
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    cement: [30, 32, 35, 40, 38],
    sand: [45, 45, 42, 40, 42],
    water: [25, 23, 23, 20, 20],
    temperature: [30, 31, 32, 33, 31],
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
        const allDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Handle different date formats
          date:
            doc.data().date instanceof Date
              ? doc.data().date
              : doc.data().date?.toDate?.()
              ? doc.data().date.toDate()
              : new Date(doc.data().date || Date.now()),
        }));

        // Double check the user ID matching
        const history = allDocs
          .filter((doc) => doc.userId && doc.userId === user.uid)
          .sort((a, b) => b.date - a.date); // Sort by date, newest first

        console.log(
          `Found ${history.length} mixes for user ${user.uid} out of ${allDocs.length} total documents`
        );

        setMixData(history);

        // Generate chart data if we have history
        if (history.length > 0) {
          // Get only the 5 most recent mixes for charts
          const chartMixes = history.slice(0, Math.min(5, history.length));
          console.log(`Using ${chartMixes.length} mixes for chart data`);

          // Format the dates for display and REVERSE the order for charts
          // This makes oldest mix on left, newest on right
          const labels = chartMixes
            .map((mix) =>
              new Date(mix.date).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
              })
            )
            .reverse();

          // Extract values and reverse for chart display
          const cement = chartMixes.map((mix) => mix.cement || 35).reverse();
          const sand = chartMixes.map((mix) => mix.sand || 45).reverse();
          const water = chartMixes.map((mix) => mix.water || 20).reverse();
          const temperature = chartMixes
            .map((mix) => mix.temperature || 30)
            .reverse();

          console.log('Chart data:', { labels, cement, sand, water });
          setChartData({ labels, cement, sand, water, temperature });
        }

        // Format data for history table
        const formattedHistory = history.map((item) => ({
          id: item.id || '',
          date: new Date(item.date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
          }),
          cement: `${item.cement}%`,
          slump: item.water > 25 ? 'High' : item.water < 15 ? 'Low' : 'Medium',
        }));

        setMixHistory(formattedHistory);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleRowPress = (id) => {
    setSelectedMixId(id);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedMixId(null);
    setActiveTab('history');
  };

  const handleExportLog = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Export Functionality',
        'In a production environment, this would export the mix data as a CSV file.'
      );
    } else {
      Alert.alert(
        'Export Functionality',
        'In a production environment, this would export the mix data as a CSV file.',
        [{ text: 'OK' }]
      );
    }
  };

  // Find the selected mix details
  const selectedMix = selectedMixId
    ? mixHistory.find((item) => item.id === selectedMixId)
    : null;

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

  // Tab selection UI
  const renderTabSelectors = () => (
    <View style={styles.tabContainer}>
      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'analytics' && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab('analytics')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'analytics' && styles.activeTabText,
          ]}
        >
          Analytics
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'history' && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab('history')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'history' && styles.activeTabText,
          ]}
        >
          History
        </Text>
      </Pressable>
    </View>
  );

  // Details view for selected mix
  if (activeTab === 'details' && selectedMix) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={handleBackToList}>
            <ArrowLeftCircle size={24} color={COLORS.darkGray} />
            <Text style={styles.backButtonText}>Back to list</Text>
          </Pressable>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>
            Mix Details - {selectedMix.date}
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Date:</Text>
              <Text style={styles.detailsValue}>{selectedMix.date}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Cement Percentage:</Text>
              <Text style={styles.detailsValue}>{selectedMix.cement}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Slump Level:</Text>
              <Text style={styles.detailsValue}>{selectedMix.slump}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Mix ID:</Text>
              <Text style={styles.detailsValue}>MIX-{selectedMix.id}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Duration:</Text>
              <Text style={styles.detailsValue}>35 minutes</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Operator:</Text>
              <Text style={styles.detailsValue}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
          </View>

          <View style={styles.compositionCard}>
            <Text style={styles.compositionTitle}>Mix Composition</Text>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Cement:</Text>
              <Text style={styles.compositionValue}>{selectedMix.cement}</Text>
            </View>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Sand:</Text>
              <Text style={styles.compositionValue}>45%</Text>
            </View>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Water:</Text>
              <Text style={styles.compositionValue}>25%</Text>
            </View>
          </View>

          <PrimaryButton
            title="Export Mix Log"
            onPress={handleExportLog}
            style={styles.exportButton}
          />
        </View>
      </View>
    );
  }

  // History tab
  if (activeTab === 'history') {
    return (
      <View style={styles.container}>
        {renderTabSelectors()}

        <Text style={styles.title}>Previous Mixes</Text>

        <Text style={styles.description}>
          View and analyze your previous concrete mixes. Select a row to view
          detailed information.
        </Text>

        {mixHistory.length > 0 ? (
          <MixHistoryTable data={mixHistory} onRowPress={handleRowPress} />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No mix history found</Text>
            <Text style={styles.emptyStateSubtext}>
              Create a mix design to see it here
            </Text>
          </View>
        )}

        <PrimaryButton
          title="Export Log"
          onPress={handleExportLog}
          style={styles.exportButton}
          disabled={mixHistory.length === 0}
        />
      </View>
    );
  }

  // Analytics tab (default)
  return (
    <ScrollView style={styles.container}>
      {renderTabSelectors()}

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

      {mixData.length > 1 ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mix Composition History</Text>
            <Text style={styles.chartSubtitle}>Your last 5 mixes</Text>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    data: chartData.cement,
                    color: () => COLORS.primaryYellow,
                    strokeWidth: 3,
                  },
                  {
                    data: chartData.sand,
                    color: () => COLORS.blue,
                    strokeWidth: 3,
                  },
                  {
                    data: chartData.water,
                    color: () => COLORS.success,
                    strokeWidth: 3,
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
                propsForDots: {
                  r: '6', // Bigger dots
                  strokeWidth: '2',
                  stroke: COLORS.darkGray,
                },
              }}
              bezier
              style={styles.chart}
              fromZero
              yAxisLabel=""
              yAxisSuffix="%"
              verticalLabelRotation={30}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Temperature Trends</Text>
            <Text style={styles.chartSubtitle}>Your last 5 mixes</Text>
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
                  r: '5',
                  strokeWidth: '2',
                  stroke: COLORS.darkGray,
                },
              }}
              bezier
              style={styles.chart}
              verticalLabelRotation={30}
            />
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mix History</Text>
          <Text style={styles.emptyStateText}>
            Create more mixes to see trends and charts
          </Text>
          <Text style={styles.emptyStateSubtext}>
            After saving multiple mix designs, you'll see graphs showing how
            your mixes have evolved over time
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mix History ({mixData.length})</Text>
        {mixData.length > 0 ? (
          <View style={styles.mixListContainer}>
            {mixData.map((mix, index) => (
              <View key={mix.id} style={styles.mixListItem}>
                <View style={styles.mixListHeader}>
                  <Text style={styles.mixListDate}>
                    {new Date(mix.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.mixListName}>
                    {mix.notes || 'Unnamed Mix'}
                  </Text>
                </View>
                <View style={styles.mixListComposition}>
                  <Text style={styles.compositionText}>
                    Cement: {mix.cement}%
                  </Text>
                  <Text style={styles.compositionText}>Sand: {mix.sand}%</Text>
                  <Text style={styles.compositionText}>
                    Water: {mix.water}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyStateSubtext}>No mix history found</Text>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: COLORS.primaryYellow,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeTabText: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.black,
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
  chartSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    fontStyle: 'italic',
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
  mixListContainer: {
    marginTop: 8,
  },
  mixListItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  mixListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mixListDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.blue,
  },
  mixListName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  mixListComposition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compositionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginVertical: 12,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginVertical: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: COLORS.primaryYellow,
    marginTop: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  detailsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailsValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  compositionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  compositionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  compositionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  compositionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  compositionValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
