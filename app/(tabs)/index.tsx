// Powered by OnSpace.AI
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRates } from '@/hooks/useRates';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { RateCard } from '@/components/ui/RateCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Rate, CURRENCY_META } from '@/services/nbrbService';
import { spacing, radius, fontSize } from '@/constants/theme';

type Filter = 'all' | 'favorites' | 'popular';

const POPULAR = ['USD', 'EUR', 'RUB', 'CNY', 'GBP', 'CHF'];

export default function RatesScreen() {
  const { theme } = useTheme();
  const { rates, loading, error, lastUpdated, refresh } = useRates();
  const { favorites } = useFavorites();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = rates;
    if (filter === 'favorites') list = list.filter((r) => favorites.includes(r.Cur_Abbreviation));
    if (filter === 'popular') list = list.filter((r) => POPULAR.includes(r.Cur_Abbreviation));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.Cur_Abbreviation.toLowerCase().includes(q) ||
          r.Cur_Name.toLowerCase().includes(q) ||
          (CURRENCY_META[r.Cur_Abbreviation]?.nameRu || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rates, filter, search, favorites]);

  const dateStr = lastUpdated
    ? lastUpdated.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'favorites', label: 'Избранные' },
    { key: 'popular', label: 'Популярные' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Будь в курсе</Text>
          {dateStr ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Курс НБРБ на {dateStr}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={refresh}
          style={({ pressed }) => [
            styles.refreshBtn,
            { backgroundColor: theme.primaryLight, opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={8}
        >
          <MaterialIcons name="refresh" size={20} color={theme.primary} />
        </Pressable>
      </View>

      {/* BYN Hero Chip */}
      <View style={[styles.bynChip, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '33' }]}>
        <Text style={styles.bynFlag}>🇧🇾</Text>
        <Text style={[styles.bynText, { color: theme.primary }]}>
          BYN — Белорусский рубль — базовая валюта
        </Text>
      </View>

      {/* Search */}
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.sm }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Найти валюту..." />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.primary : theme.surface,
                borderColor: filter === f.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === f.key ? '#fff' : theme.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Error */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.dangerLight }]}>
          <MaterialIcons name="error-outline" size={18} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={[styles.retryText, { color: theme.primary }]}>Повторить</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Loading */}
      {loading && rates.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Загрузка курсов...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.Cur_ID)}
          renderItem={({ item }) => (
            <RateCard
              rate={item}
              onPress={() =>
                router.push({
                  pathname: '/detail',
                  params: { id: item.Cur_ID, code: item.Cur_Abbreviation },
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading && rates.length > 0}
              onRefresh={refresh}
              tintColor={theme.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 40 }}>🔍</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Ничего не найдено
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  refreshBtn: {
    padding: spacing.sm,
    borderRadius: radius.full,
  },
  bynChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  bynFlag: { fontSize: 18 },
  bynText: { fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  filterLabel: { fontSize: fontSize.sm, fontWeight: '500' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },
  retryText: { fontSize: fontSize.sm, fontWeight: '600' },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: { fontSize: fontSize.md },
  listContent: { paddingBottom: spacing.xl },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: { fontSize: fontSize.md },
});
