// Powered by OnSpace.AI
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRates } from '@/hooks/useRates';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Rate, CURRENCY_META } from '@/services/nbrbService';
import { spacing, radius, fontSize } from '@/constants/theme';

// BYN as virtual rate
const BYN_RATE: Rate = {
  Cur_ID: 0,
  Date: '',
  Cur_Abbreviation: 'BYN',
  Cur_Scale: 1,
  Cur_Name: 'Белорусский рубль',
  Cur_OfficialRate: 1,
};

function getBynRate(rates: Rate[], code: string): number {
  if (code === 'BYN') return 1;
  const r = rates.find((r) => r.Cur_Abbreviation === code);
  if (!r) return 1;
  return r.Cur_OfficialRate / r.Cur_Scale;
}

// Format number with thousand separators
function formatAmount(value: number, code: string): string {
  if (!isFinite(value) || isNaN(value)) return '—';
  if (code === 'RUB' || code === 'JPY' || code === 'UZS') {
    return Math.round(value).toLocaleString('ru-RU');
  }
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface FavPickerProps {
  visible: boolean;
  rates: Rate[];
  favorites: string[];
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

function FavPicker({ visible, rates, favorites, selected, onSelect, onClose }: FavPickerProps) {
  const { theme } = useTheme();

  const favRates = useMemo(() => {
    const all = [BYN_RATE, ...rates];
    return all.filter((r) => favorites.includes(r.Cur_Abbreviation));
  }, [rates, favorites]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: theme.bg }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Источник конвертации</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <MaterialIcons name="close" size={24} color={theme.icon} />
          </Pressable>
        </View>
        <FlatList
          data={favRates}
          keyExtractor={(item) => item.Cur_Abbreviation}
          renderItem={({ item }) => {
            const meta = CURRENCY_META[item.Cur_Abbreviation];
            const isSelected = item.Cur_Abbreviation === selected;
            return (
              <Pressable
                onPress={() => { onSelect(item.Cur_Abbreviation); onClose(); }}
                style={({ pressed }) => [
                  styles.pickerItem,
                  {
                    backgroundColor: isSelected
                      ? theme.primaryLight
                      : pressed ? theme.surface : 'transparent',
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 28 }}>
                  {item.Cur_Abbreviation === 'BYN' ? '🇧🇾' : meta ? meta.flag : '🏳️'}
                </Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.pickerCode, { color: theme.text }]}>{item.Cur_Abbreviation}</Text>
                  <Text style={[styles.pickerName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.Cur_Abbreviation === 'BYN' ? 'Белорусский рубль' : meta ? meta.nameRu : item.Cur_Name}
                  </Text>
                </View>
                {isSelected && <MaterialIcons name="check" size={22} color={theme.primary} />}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

export default function ConverterScreen() {
  const { theme } = useTheme();
  const { rates } = useRates();
  const { favorites } = useFavorites();

  // Ensure BYN is always first option
  const favWithByn = useMemo(() => {
    const list = ['BYN', ...favorites.filter((f) => f !== 'BYN')];
    return list;
  }, [favorites]);

  const [fromCode, setFromCode] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [pickerVisible, setPickerVisible] = useState(false);

  // Auto-fix fromCode if it's not in favorites anymore
  const effectiveFrom = useMemo(() => {
    if (favWithByn.includes(fromCode)) return fromCode;
    return favWithByn[0] || 'USD';
  }, [fromCode, favWithByn]);

  const fromMeta = CURRENCY_META[effectiveFrom];
  const fromFlag = effectiveFrom === 'BYN' ? '🇧🇾' : fromMeta ? fromMeta.flag : '🏳️';
  const fromName = effectiveFrom === 'BYN' ? 'Белорусский рубль' : fromMeta ? fromMeta.nameRu : effectiveFrom;

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount.replace(',', '.').replace(/\s/g, ''));
    return isNaN(n) ? 0 : n;
  }, [amount]);

  // Compute results for all favorites except the from currency
  const results = useMemo(() => {
    return favWithByn
      .filter((code) => code !== effectiveFrom)
      .map((code) => {
        const fromRate = getBynRate(rates, effectiveFrom);
        const toRate = getBynRate(rates, code);
        const byn = parsedAmount * fromRate;
        const converted = toRate > 0 ? byn / toRate : 0;
        const meta = CURRENCY_META[code];
        return {
          code,
          flag: code === 'BYN' ? '🇧🇾' : meta ? meta.flag : '🏳️',
          name: code === 'BYN' ? 'Белорусский рубль' : meta ? meta.nameRu : code,
          value: converted,
          formatted: formatAmount(converted, code),
        };
      });
  }, [favWithByn, effectiveFrom, parsedAmount, rates]);

  // Cross-rate for info chip
  const crossRate = useMemo(() => {
    if (results.length === 0 || rates.length === 0) return '';
    const first = results[0];
    const fromRate = getBynRate(rates, effectiveFrom);
    const toRate = getBynRate(rates, first.code);
    if (toRate === 0) return '';
    const cross = fromRate / toRate;
    return `1 ${effectiveFrom} = ${formatAmount(cross, first.code)} ${first.code}`;
  }, [results, rates, effectiveFrom]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Sticky input area */}
        <View style={[styles.topSection, { backgroundColor: theme.bg }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Конвертер</Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>НБРБ · Избранные</Text>
          </View>

          {/* From currency card */}
          <View style={[styles.fromCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [
                styles.currBtn,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary + '44', opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.bigFlag}>{fromFlag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.currCode, { color: theme.primary }]}>{effectiveFrom}</Text>
                <Text style={[styles.currName, { color: theme.textSecondary }]} numberOfLines={1}>{fromName}</Text>
              </View>
              <MaterialIcons name="expand-more" size={22} color={theme.primary} />
            </Pressable>

            <TextInput
              style={[styles.amountInput, { color: theme.text, borderBottomColor: theme.primary }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              selectTextOnFocus
            />

            {/* Quick amounts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRow}
              style={{ marginTop: spacing.sm }}
            >
              {['1', '10', '50', '100', '500', '1000', '5000'].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setAmount(v)}
                  style={({ pressed }) => [
                    styles.quickBtn,
                    {
                      backgroundColor: amount === v ? theme.primary : theme.surface,
                      borderColor: amount === v ? theme.primary : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.quickLabel, { color: amount === v ? '#fff' : theme.textSecondary }]}>
                    {v}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Cross-rate hint */}
          {crossRate ? (
            <View style={[styles.infoBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '33' }]}>
              <MaterialIcons name="info-outline" size={15} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.primary }]}>{crossRate}</Text>
            </View>
          ) : null}

          {/* Divider with label */}
          <View style={styles.sectionHeader}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.sectionLabel, { color: theme.textSecondary, backgroundColor: theme.bg }]}>
              РЕЗУЛЬТАТ
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>
        </View>

        {/* Results list */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 36 }}>⭐</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Добавьте валюты в избранные{'\n'}в разделе Настройки
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ResultRow
              code={item.code}
              flag={item.flag}
              name={item.name}
              formatted={item.formatted}
              amount={parsedAmount}
              fromCode={effectiveFrom}
            />
          )}
          ListFooterComponent={
            results.length > 0 ? (
              <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
                Данные Национального банка Республики Беларусь
              </Text>
            ) : null
          }
        />
      </KeyboardAvoidingView>

      <FavPicker
        visible={pickerVisible}
        rates={rates}
        favorites={favWithByn}
        selected={effectiveFrom}
        onSelect={setFromCode}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

interface ResultRowProps {
  code: string;
  flag: string;
  name: string;
  formatted: string;
  amount: number;
  fromCode: string;
}

const ResultRow = React.memo(function ResultRow({ code, flag, name, formatted }: ResultRowProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.resultFlag}>{flag}</Text>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultCode, { color: theme.text }]}>{code}</Text>
        <Text style={[styles.resultName, { color: theme.textSecondary }]} numberOfLines={1}>{name}</Text>
      </View>
      <Text style={[styles.resultValue, { color: theme.primary }]}>{formatted}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topSection: {
    paddingBottom: spacing.xs,
  },
  headerRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700' },
  sub: { fontSize: fontSize.sm },
  fromCard: {
    marginHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  currBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bigFlag: { fontSize: 28 },
  currCode: { fontSize: fontSize.lg, fontWeight: '700', lineHeight: 22 },
  currName: { fontSize: fontSize.xs, marginTop: 1 },
  amountInput: {
    fontSize: 40,
    fontWeight: '300',
    textAlign: 'right',
    borderBottomWidth: 2,
    paddingBottom: spacing.xs,
    includeFontPadding: false,
    paddingHorizontal: spacing.xs,
    color: '#000',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  quickBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  quickLabel: { fontSize: fontSize.sm, fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  infoText: { fontSize: fontSize.xs, fontWeight: '500', flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1 },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  resultsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  resultFlag: { fontSize: 30 },
  resultInfo: { flex: 1 },
  resultCode: { fontSize: fontSize.md, fontWeight: '700' },
  resultName: { fontSize: fontSize.xs, marginTop: 2, color: '#888' },
  resultValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    flexShrink: 0,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
  disclaimer: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // Picker
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerCode: { fontSize: fontSize.md, fontWeight: '700' },
  pickerName: { fontSize: fontSize.sm, marginTop: 2 },
});
