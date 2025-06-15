import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, TextInput, I18nManager } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an i18n instance
const i18n = new I18n({});
i18n.locale = 'en';
i18n.enableFallback = true;

// Define language interface
interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL?: boolean;
}

// Language data
const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda' },
];

// Translations
i18n.translations = {
  en: {
    title: 'Language',
    searchPlaceholder: 'Search languages',
    noResults: 'No languages found for "{query}"',
  },
  fr: {
    title: 'Langue',
    searchPlaceholder: 'Rechercher des langues',
    noResults: 'Aucune langue trouvée pour "{query}"',
  },
  ar: {
    title: 'اللغة',
    searchPlaceholder: 'البحث عن اللغات',
    noResults: 'لم يتم العثور على لغات لـ "{query}"',
  },
  sw: {
    title: 'Lugha',
    searchPlaceholder: 'Tafuta lugha',
    noResults: 'Hakuna lugha zilizopatikana kwa "{query}"',
  },
  am: {
    title: 'ቋንቋ',
    searchPlaceholder: 'ቋንቋዎችን ፈልግ',
    noResults: '"{query}" ላይ ምንም ቋንቋዎች አልተገኙም',
  },
  yo: {
    title: 'Èdè',
    searchPlaceholder: 'Wa awọn èdè',
    noResults: 'Kò sí èdè tí a rí fún "{query}"',
  },
  ha: {
    title: 'Yare',
    searchPlaceholder: 'Nemo harsuna',
    noResults: 'Ba a sami harsuna don "{query}" ba',
  },
  ig: {
    title: 'Asụsụ',
    searchPlaceholder: 'Chọọ asụsụ',
    noResults: 'Enweghị asụsụ e chọtara maka "{query}"',
  },
  zu: {
    title: 'Ulimi',
    searchPlaceholder: 'Sesha izilimi',
    noResults: 'Azikho izilimi ezitholakele ze-"{query}"',
  },
  xh: {
    title: 'Ulwimi',
    searchPlaceholder: 'Khangela iilwimi',
    noResults: 'Azikho iilwimi ezifunyenweyo ze-"{query}"',
  },
  rw: {
    title: 'Ururimi',
    searchPlaceholder: 'Shakisha indimi',
    noResults: 'Nta ndimi zibonetse za "{query}"',
  },
  lg: {
    title: 'Lulimi',
    searchPlaceholder: 'Noonya ennimi',
    noResults: 'Tewali nnimi ezizuuliddwa za "{query}"',
  },
};

// Fallback to English if translation is missing
// enableFallback is already set when creating the i18n instance

// Initialize i18n with device locale or stored preference
const initializeI18n = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('appLanguage');
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    const initialLocale = storedLanguage || deviceLocale;

    i18n.locale = languages.some(lang => lang.code === initialLocale) ? initialLocale : 'en';

    // Set RTL for Arabic
    const isRTL = languages.find(lang => lang.code === i18n.locale)?.isRTL || false;
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

const LanguageSettings: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.locale);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialize i18n on mount
  useEffect(() => {
    initializeI18n();
  }, []);

  // Filter languages based on search query
  const filteredLanguages = searchQuery
    ? languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : languages;

  // Handle language selection
  const selectLanguage = async (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.locale = langCode;

    // Persist language choice
    try {
      await AsyncStorage.setItem('appLanguage', langCode);
    } catch (error) {
      console.error('Error saving language:', error);
    }

    // Update RTL settings
    const isRTL = languages.find(lang => lang.code === langCode)?.isRTL || false;
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    // Go back to settings
    setTimeout(() => {
      router.back();
    }, 500);
  };

  // Render language item
  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => selectLanguage(item.code)}
    >
      <View style={styles.languageName}>
        <ThemedText style={styles.languageNameText}>{item.name}</ThemedText>
        <ThemedText style={styles.languageNativeText}>{item.nativeName}</ThemedText>
      </View>
      {selectedLanguage === item.code && (
        <Ionicons name="checkmark" size={24} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <ThemedText style={styles.title}>{i18n.t('title')}</ThemedText>
          <View style={styles.rightPlaceholder} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text, textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
            placeholder={i18n.t('searchPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={item => item.code}
          contentContainerStyle={styles.languageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.textSecondary} />
              <ThemedText style={styles.emptyText}>
                {i18n.t('noResults', { query: searchQuery })}
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: 28,
  },
  searchContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: I18nManager.isRTL ? 0 : 8,
    marginLeft: I18nManager.isRTL ? 8 : 0,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  languageList: {
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  selectedLanguageItem: {
    // No special styling needed - checkmark indicates selection
  },
  languageName: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
  languageNameText: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  languageNativeText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default LanguageSettings;
