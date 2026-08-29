// Powered by OnSpace.AI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CURRENCY_META } from '@/services/nbrbService';
import { spacing, radius, fontSize } from '@/constants/theme';

const ALL_POPULAR = ['USD', 'EUR', 'RUB', 'CNY', 'GBP', 'CHF', 'JPY', 'PLN', 'UAH', 'KZT', 'TRY', 'CAD', 'AUD', 'SEK', 'NOK'];

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Настройки</Text>
        </View>

        {/* Appearance */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>ОФОРМЛЕНИЕ</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={20} color={theme.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Тёмная тема</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                {isDark ? 'Включена' : 'Выключена'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Favorites */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>ИЗБРАННЫЕ ВАЛЮТЫ</Text>
        <Text style={[styles.sectionHint, { color: theme.textMuted }]}>
          Отмеченные отображаются в фильтре «Избранные»
        </Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {ALL_POPULAR.map((code, idx) => {
            const meta = CURRENCY_META[code];
            const fav = isFavorite(code);
            return (
              <Pressable
                key={code}
                onPress={() => toggleFavorite(code)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.flag}>{meta ? meta.flag : '🏳️'}</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>{code}</Text>
                  <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                    {meta ? meta.nameRu : code}
                  </Text>
                </View>
                <MaterialIcons
                  name={fav ? 'star' : 'star-border'}
                  size={22}
                  color={fav ? '#F5A623' : theme.icon}
                />
              </Pressable>
            );
          })}
        </View>

        {/* About */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>О ПРИЛОЖЕНИИ</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
              <Text style={{ fontSize: 18 }}>🇧🇾</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Будь в курсе</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                Версия 1.0.0
              </Text>
            </View>
          </View>
          <View style={[styles.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="account-balance" size={20} color={theme.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Источник данных</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                api.nbrb.by — Национальный банк РБ
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
          Курсы обновляются ежедневно. Данные носят информационный характер.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700' },
  section: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 28 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: fontSize.md, fontWeight: '500' },
  rowSub: { fontSize: fontSize.sm, marginTop: 2 },
  disclaimer: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },
});
