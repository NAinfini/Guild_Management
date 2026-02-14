import { describe, expect, it } from 'vitest';
import zh from '@/i18n/locales/zh.json';

describe('zh localization quality', () => {
  it('uses Chinese labels for primary navigation and account controls', () => {
    expect(zh.nav.dashboard).toBe('总览');
    expect(zh.nav.events).toBe('活动');
    expect(zh.nav.roster).toBe('成员');
    expect(zh.nav.guild_war).toBe('公会战');
    expect(zh.nav.announcements).toBe('公告');
    expect(zh.nav.tools).toBe('工具');
    expect(zh.nav.wiki).toBe('攻略');
    expect(zh.nav.gallery).toBe('画廊');
    expect(zh.nav.profile).toBe('个人');
    expect(zh.nav.settings).toBe('设置');
    expect(zh.nav.account).toBe('账号');
    expect(zh.settings.interface_theme).toBe('界面主题');
    expect(zh.settings.color_palette).toBe('配色方案');
    expect(zh.settings.language).toBe('语言');
    expect(zh.settings.language_english).toBe('英文');
    expect(zh.settings.language_chinese).toBe('中文');
  });

  it('uses Chinese names for theme and color menu options', () => {
    expect(zh.theme_menu.themes['neo-brutalism'].label).toBe('新粗野主义');
    expect(zh.theme_menu.themes.steampunk.label).toBe('蒸汽朋克');
    expect(zh.theme_menu.themes.cyberpunk.label).toBe('赛博朋克');
    expect(zh.theme_menu.colors['black-gold'].label).toBe('黑金');
    expect(zh.theme_menu.colors['default-violet'].label).toBe('默认紫');
  });
});
