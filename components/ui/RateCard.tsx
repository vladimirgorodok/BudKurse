// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Rate, CURRENCY_META } from '@/services/nbrbService';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { spacing, radius, fontSize } from '@/constants/theme';

interface Props {
  rate: Rate;
  onPress?: () => void;
}

export const RateCard = memo(({ rate, onPress }: Props) => {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const meta = CURRENCY_META[rate.Cur_Abbreviation];
  const fav = isFavorite(rate.Cur_Abbreviation);

  const rateLabel =
    rate.Cur_Scale > 1
      ? `${rate.Cur_Scale} ${rate.Cur_Abbreviation} = ${rate.Cur_OfficialRate.toFixed(4)} BYN`
      : `1 ${rate.Cur_Abbreviation} = ${rate.Cur_OfficialRate.toFixed(4)} BYN`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={styles.flag}>{meta ? meta.flag : '🏳️'}</Text>
        <View style={styles.info}>
          <Text style={[styles.code, { color: theme.text }]}>{rate.Cur_Abbreviation}</Text>
          <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>
            {meta ? meta.nameRu : rate.Cur_Name}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.rateText, { color: theme.text }]}>
          {rate.Cur_OfficialRate.toFixed(4)}
        </Text>
        {rate.Cur_Scale > 1 && (
          <Text style={[styles.scale, { color: theme.textMuted }]}>за {rate.Cur_Scale}</Text>
        )}
        <Pressable
          onPress={() => toggleFavorite(rate.Cur_Abbreviation)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.favBtn}
        >
          <MaterialIcons
            name={fav ? 'star' : 'star-border'}
            size={20}
            color={fav ? '#F5A623' : theme.icon}
          />
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 30,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  name: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  scale: {
    fontSize: fontSize.xs,
  },
  favBtn: {
    marginTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
