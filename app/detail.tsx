// Powered by OnSpace.AI
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fetchRateHistory, fetchRateByCode, Rate, CURRENCY_META } from '@/services/nbrbService';
import { spacing, radius, fontSize } from '@/constants/theme';

export default function DetailScreen() {
  const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const [rate, setRate] = useState<Rate | null>(null);
  const [history, setHistory] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = CURRENCY_META[code || ''];
  const fav = isFavorite(code || '');

  useEffect(() => {
    if (!code || !id) return;
    setLoading(true);
    Promise.all([
      fetchRateByCode(code).catch(() => null),
      fetchRateHistory(Number(id), 30).catch(() => []),
    ]).then(([r, h]) => {
      if (r) setRate(r);
      setHistory(h as Rate[]);
      setLoading(false);
    });
  }, [code, id]);

  const maxRate = history.length > 0 ? Math.max(...history.map((h) => h.Cur_OfficialRate)) : 0;
  const minRate = history.length > 0 ? Math.min(...history.map((h) => h.Cur_OfficialRate)) : 0;
  const avgRate = history.length > 0 ? history.reduce((s, h) => s + h.Cur_OfficialRate, 0) / history.length : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{code}</Text>
        <Pressable
          onPress={() => toggleFavorite(code || '')}
          hitSlop={8}
          style={styles.favBtn}
        >
          <MaterialIcons
            name={fav ? 'star' : 'star-border'}
            size={24}
            color={fav ? '#F5A623' : theme.icon}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.heroFlag}>{meta ? meta.flag : '🏳️'}</Text>
              <Text style={[styles.heroCode, { color: theme.text }]}>{code}</Text>
              <Text style={[styles.heroName, { color: theme.textSecondary }]}>
                {meta ? meta.nameRu : rate?.Cur_Name}
              </Text>
              {rate && (
                <Text style={[styles.heroRate, { color: theme.primary }]}>
                  {rate.Cur_Scale > 1 ? `${rate.Cur_Scale} ${code} = ` : `1 ${code} = `}
                  <Text style={{ color: theme.text }}>{rate.Cur_OfficialRate.toFixed(4)} BYN</Text>
                </Text>
              )}
            </View>

            {/* Stats */}
            {history.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  СТАТИСТИКА ЗА 30 ДНЕЙ
                </Text>
                <View style={styles.statsRow}>
                  {[
                    { label: 'Максимум', value: maxRate.toFixed(4), icon: 'arrow-upward', color: theme.success },
                    { label: 'Среднее', value: avgRate.toFixed(4), icon: 'remove', color: theme.primary },
                    { label: 'Минимум', value: minRate.toFixed(4), icon: 'arrow-downward', color: theme.danger },
                  ].map((s) => (
                    <View
                      key={s.label}
                      style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      <MaterialIcons name={s.icon as any} size={16} color={s.color} />
                      <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Mini chart - bar sparkline */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ДИНАМИКА</Text>
                <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.bars}>
                    {history.slice(-20).map((h, i) => {
                      const range = maxRate - minRate || 1;
                      const pct = ((h.Cur_OfficialRate - minRate) / range) * 100;
                      const isLast = i === history.slice(-20).length - 1;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.bar,
                            {
                              height: `${Math.max(8, pct)}%`,
                              backgroundColor: isLast ? theme.primary : theme.primaryLight,
                              borderRadius: 2,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.chartLabels}>
                    <Text style={[styles.chartLabel, { color: theme.textMuted }]}>
                      {history[0]?.Date ? new Date(history[0].Date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : ''}
                    </Text>
                    <Text style={[styles.chartLabel, { color: theme.textMuted }]}>Сегодня</Text>
                  </View>
                </View>
              </>
            )}

            {/* Recent history list */}
            {history.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ИСТОРИЯ</Text>
                <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {history.slice(-10).reverse().map((h, i) => {
                    const prev = history.slice(-10).reverse()[i + 1];
                    const diff = prev ? h.Cur_OfficialRate - prev.Cur_OfficialRate : 0;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.historyRow,
                          {
                            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                            borderTopColor: theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                          {new Date(h.Date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                        <Text style={[styles.historyRate, { color: theme.text }]}>
                          {h.Cur_OfficialRate.toFixed(4)}
                        </Text>
                        {diff !== 0 && (
                          <View style={styles.diffRow}>
                            <MaterialIcons
                              name={diff > 0 ? 'arrow-upward' : 'arrow-downward'}
                              size={12}
                              color={diff > 0 ? theme.success : theme.danger}
                            />
                            <Text
                              style={[
                                styles.diffText,
                                { color: diff > 0 ? theme.success : theme.danger },
                              ]}
                            >
                              {Math.abs(diff).toFixed(4)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: '700', textAlign: 'center' },
  favBtn: { padding: spacing.xs },
  content: { paddingBottom: spacing.xxl },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  hero: {
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  heroFlag: { fontSize: 56 },
  heroCode: { fontSize: fontSize.xxl, fontWeight: '700' },
  heroName: { fontSize: fontSize.md },
  heroRate: { fontSize: fontSize.xl, fontWeight: '600', marginTop: spacing.sm },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statValue: { fontSize: fontSize.md, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs },
  chartCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 120,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    flex: 1,
    minWidth: 6,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  chartLabel: { fontSize: fontSize.xs },
  historyCard: {
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    gap: spacing.sm,
  },
  historyDate: { flex: 1, fontSize: fontSize.sm },
  historyRate: { fontSize: fontSize.md, fontWeight: '600' },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  diffText: { fontSize: fontSize.xs, fontWeight: '500' },
});
