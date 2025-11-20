import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import appConfig from '../config/appConfig';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import BannerAdPlaceholder from '../components/BannerAdPlaceholder';

export default function HomeScreen({ navigation }) {
  const { scanHistory, generatedHistory, language, currentTheme } = useAppContext();
  const t = createTranslator(language);
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const totalScanned = scanHistory.length;
  const totalGenerated = generatedHistory.length;
  
  const recentActivity = [...scanHistory, ...generatedHistory]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const Container = appConfig.ui.ENABLE_GRADIENT_BACKGROUND ? LinearGradient : View;
  const containerProps = appConfig.ui.ENABLE_GRADIENT_BACKGROUND ? {
    colors: [colorScheme.background, colorScheme.card],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } : { style: { flex: 1, backgroundColor: colorScheme.background } };

  return (
    <Container {...containerProps} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            {t('app_title')}
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme.mutedText }]}>
            {t('app_subtitle')}
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={t('home_scan')}
            onPress={() => navigation.navigate('Scanner')}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <PrimaryButton
            title={t('home_generate')}
            onPress={() => navigation.navigate('Generator')}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>

        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Ionicons name="scan-outline" size={32} color={colorScheme.primary} />
            <Text style={[styles.statNumber, { color: colorScheme.text }]}>
              {totalScanned}
            </Text>
            <Text style={[styles.statLabel, { color: colorScheme.mutedText }]}>
              {t('home_total_scanned')}
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Ionicons name="qr-code-outline" size={32} color={colorScheme.accent} />
            <Text style={[styles.statNumber, { color: colorScheme.text }]}>
              {totalGenerated}
            </Text>
            <Text style={[styles.statLabel, { color: colorScheme.mutedText }]}>
              {t('home_total_generated')}
            </Text>
          </Card>
        </View>

        <Card>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            {t('home_recent_activity')}
          </Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((item, index) => (
              <View key={item.id} style={styles.activityItem}>
                <Ionicons 
                  name={item.type === 'SCANNED' ? 'scan-outline' : 'qr-code-outline'} 
                  size={20} 
                  color={colorScheme.primary} 
                />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: colorScheme.text }]} numberOfLines={1}>
                    {item.content.length > 30 ? item.content.substring(0, 30) + '...' : item.content}
                  </Text>
                  <Text style={[styles.activityTime, { color: colorScheme.mutedText }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noActivity, { color: colorScheme.mutedText }]}>
              No recent activity
            </Text>
          )}
        </Card>
      </ScrollView>
      
      <BannerAdPlaceholder placement="home" />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
  noActivity: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});