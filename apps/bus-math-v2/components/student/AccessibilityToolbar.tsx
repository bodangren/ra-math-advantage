"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Globe,
  Type,
  Eye,
  BookOpen,
  Palette
} from 'lucide-react'
import type { AccessibilityPreferences } from '@/lib/schemas/profiles'

interface AccessibilityToolbarProps {
  preferences: AccessibilityPreferences
  onPreferencesChange: (preferences: Partial<AccessibilityPreferences>) => void
  className?: string
}


/**
 * Renders a floating toolbar for accessibility preferences including language,
 * font size, high contrast, reading level, and vocabulary toggles.
 *
 * @param props - Component props.
 * @param props.preferences - Current accessibility preferences.
 * @param props.onPreferencesChange - Callback to update preferences.
 * @param props.className - Optional additional CSS class.
 * @returns A fixed-position toolbar card.
 */
export function AccessibilityToolbar({
  preferences,
  onPreferencesChange,
  className = ''
}: AccessibilityToolbarProps) {
  /**
   * Updates the language preference.
   *
   * @param language - The new language code.
   */
  const handleLanguageChange = (language: 'en' | 'zh') => {
    onPreferencesChange({ language })
  }


  /**
   * Updates the font size preference.
   *
   * @param fontSize - The new font size setting.
   */
  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    onPreferencesChange({ fontSize })
  }


  /**
   * Toggles the high contrast preference.
   */
  const handleHighContrastToggle = () => {
    onPreferencesChange({ highContrast: !preferences.highContrast })
  }


  /**
   * Updates the reading level preference.
   *
   * @param readingLevel - The new reading level setting.
   */
  const handleReadingLevelChange = (readingLevel: 'basic' | 'intermediate' | 'advanced') => {
    onPreferencesChange({ readingLevel })
  }


  /**
   * Toggles the vocabulary display preference.
   */
  const handleVocabularyToggle = () => {
    onPreferencesChange({ showVocabulary: !preferences.showVocabulary })
  }

  return (
    <Card
      className={`fixed top-4 right-4 z-10 p-3 shadow-lg ${
        preferences.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white'
      } ${className}`}
      role="toolbar"
      aria-label="Accessibility settings"
    >
      <div className="flex items-center gap-2">
        {/* Language Selection */}
        <div className="flex items-center gap-1" role="group" aria-label="Language selection">
          <Globe className={`h-4 w-4 ${preferences.highContrast ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
          <Button
            variant={preferences.language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange('en')}
            className="text-xs"
            aria-label="Switch to English"
            aria-pressed={preferences.language === 'en'}
          >
            EN
          </Button>
          <Button
            variant={preferences.language === 'zh' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange('zh')}
            className="text-xs"
            aria-label="Switch to Chinese"
            aria-pressed={preferences.language === 'zh'}
          >
            中文
          </Button>
        </div>

        {/* Font Size Selection */}
        <div className="flex items-center gap-1 border-l pl-2" role="group" aria-label="Font size selection">
          <Type className={`h-4 w-4 ${preferences.highContrast ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
          <Button
            variant={preferences.fontSize === 'small' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('small')}
            className="text-xs"
            aria-label="Small font size"
            aria-pressed={preferences.fontSize === 'small'}
          >
            A
          </Button>
          <Button
            variant={preferences.fontSize === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('medium')}
            className="text-sm"
            aria-label="Medium font size"
            aria-pressed={preferences.fontSize === 'medium'}
          >
            A
          </Button>
          <Button
            variant={preferences.fontSize === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('large')}
            className="text-base"
            aria-label="Large font size"
            aria-pressed={preferences.fontSize === 'large'}
          >
            A
          </Button>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center gap-1 border-l pl-2">
          <Eye className={`h-4 w-4 ${preferences.highContrast ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
          <Button
            variant={preferences.highContrast ? 'default' : 'outline'}
            size="sm"
            onClick={handleHighContrastToggle}
            className="text-xs"
            aria-label={preferences.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            aria-pressed={preferences.highContrast}
          >
            <Palette className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>

        {/* Reading Level Selection */}
        <div className="flex items-center gap-1 border-l pl-2">
          <BookOpen className={`h-4 w-4 ${preferences.highContrast ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
          <select
            value={preferences.readingLevel}
            onChange={(e) => handleReadingLevelChange(e.target.value as 'basic' | 'intermediate' | 'advanced')}
            className={`text-xs border rounded px-2 py-1 ${
              preferences.highContrast
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            aria-label="Reading level"
          >
            <option value="basic">{preferences.language === 'en' ? 'Basic' : '基础'}</option>
            <option value="intermediate">{preferences.language === 'en' ? 'Intermediate' : '中级'}</option>
            <option value="advanced">{preferences.language === 'en' ? 'Advanced' : '高级'}</option>
          </select>
        </div>

        {/* Vocabulary Toggle */}
        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant={preferences.showVocabulary ? 'default' : 'outline'}
            size="sm"
            onClick={handleVocabularyToggle}
            className="text-xs"
            aria-label={preferences.showVocabulary ? 'Hide vocabulary' : 'Show vocabulary'}
            aria-pressed={preferences.showVocabulary}
          >
            📚
          </Button>
        </div>
      </div>
    </Card>
  )
}
