export type ProgressionCategoryId = 'qishu' | 'wuxue' | 'xinfa';

export interface ProgressionItem {
  key: string; // snake_case pinyin
  nameKey: string; // i18n key
  icon: string; // public path
}

export interface ProgressionGroup {
  key: string;
  titleKey: string;
  items: ProgressionItem[];
}

export interface ProgressionCategory {
  id: ProgressionCategoryId;
  titleKey: string;
  groups: ProgressionGroup[];
}

const qishuIconBase = '/燕云十六声图标/奇术图标';
const xinfaIconBase = '/燕云十六声图标/心法图标';
const wuxueIconBase = '/燕云十六声图标/武学图标';
const fallbackIcon = '/燕云十六声图标/其他加成.webp';

const wuxueIconMap: Record<string, string> = {
  九曲惊神枪: `${wuxueIconBase}/九曲惊神枪.webp`,
  九重春色: `${wuxueIconBase}/九重春色.webp`,
  八方风雷枪: `${wuxueIconBase}/八方风雷枪.webp`,
  十方破阵: `${wuxueIconBase}/十方破阵.webp`,
  千机素天: `${wuxueIconBase}/千机素天.webp`,
  千香引魂蛊: `${wuxueIconBase}/千香引魂蛊.webp`,
  嗟夫刀法: `${wuxueIconBase}/嗟夫刀法.webp`,
  天志垂象: `${wuxueIconBase}/天志垂象.webp`,
  斩雪刀法: `${wuxueIconBase}/斩雪刀法.webp`,
  无名剑法: `${wuxueIconBase}/无名剑法.webp`,
  无名枪法: `${wuxueIconBase}/无名枪法.webp`,
  明川药典: `${wuxueIconBase}/明川药典.webp`,
  泥犁三垢: `${wuxueIconBase}/泥犁三垢.webp`,
  积矩九剑: `${wuxueIconBase}/积矩九剑.webp`,
  粟子游尘: `${wuxueIconBase}/粟子游尘.webp`,
  粟子行云: `${wuxueIconBase}/粟子行云.webp`,
  醉梦游春: `${wuxueIconBase}/醉梦游春.webp`,
  青山执笔: `${wuxueIconBase}/青山执笔.webp`,
};

const qishuItems: ProgressionGroup[] = [
  {
    key: 'qunti_yichang',
    titleKey: 'progression.qishu.groups.qunti_yichang',
    items: [
      { key: 'shi_hou_zheng_sheng', nameKey: 'progression.items.shi_hou_zheng_sheng', icon: `${qishuIconBase}/狮吼正声.webp` },
      { key: 'jin_chan_teng_yue', nameKey: 'progression.items.jin_chan_teng_yue', icon: `${qishuIconBase}/金蟾腾跃.webp` },
      { key: 'yan_jiu_shi', nameKey: 'progression.items.yan_jiu_shi', icon: `${qishuIconBase}/衍九矢.webp` },
    ],
  },
  {
    key: 'qunti_shanghai',
    titleKey: 'progression.qishu.groups.qunti_shanghai',
    items: [
      { key: 'bai_gui_da_xue_shou', nameKey: 'progression.items.bai_gui_da_xue_shou', icon: `${qishuIconBase}/百鬼打穴手.webp` },
      { key: 'wei_tuo_zheng_fa', nameKey: 'progression.items.wei_tuo_zheng_fa', icon: `${qishuIconBase}/韦陀正法.webp` },
      { key: 'liu_xing_zhui_huo', nameKey: 'progression.items.liu_xing_zhui_huo', icon: `${qishuIconBase}/流行坠火.webp` },
      { key: 'xiao_yin_qian_lang', nameKey: 'progression.items.xiao_yin_qian_lang', icon: `${qishuIconBase}/萧吟千浪.webp` },
    ],
  },
  {
    key: 'danti_kongzhi',
    titleKey: 'progression.qishu.groups.danti_kongzhi',
    items: [
      { key: 'ying_zhao_lian_zao', nameKey: 'progression.items.ying_zhao_lian_zao', icon: `${qishuIconBase}/鹰爪连凿.webp` },
      { key: 'yao_cha_po_mo', nameKey: 'progression.items.yao_cha_po_mo', icon: `${qishuIconBase}/药叉破魔.webp` },
      { key: 'zi_zai_wu_ai', nameKey: 'progression.items.zi_zai_wu_ai', icon: `${qishuIconBase}/自在无碍.webp` },
      { key: 'gou_zui_duo_shi', nameKey: 'progression.items.gou_zui_duo_shi', icon: `${qishuIconBase}/狗嘴夺食.webp` },
      { key: 'qi_long_hui_ma', nameKey: 'progression.items.qi_long_hui_ma', icon: `${qishuIconBase}/骑龙回马.webp` },
    ],
  },
  {
    key: 'danti_baofa',
    titleKey: 'progression.qishu.groups.danti_baofa',
    items: [
      { key: 'shen_long_tu_huo', nameKey: 'progression.items.shen_long_tu_huo', icon: `${qishuIconBase}/神龙吐火.webp` },
      { key: 'tai_bai_zui_yue', nameKey: 'progression.items.tai_bai_zui_yue', icon: `${qishuIconBase}/太白醉月.webp` },
      { key: 'ye_long_xiang_shou', nameKey: 'progression.items.ye_long_xiang_shou', icon: `${qishuIconBase}/叶龙骧首.webp` },
      { key: 'wan_wu_wei_feng', nameKey: 'progression.items.wan_wu_wei_feng', icon: `${qishuIconBase}/万物为锋.webp` },
    ],
  },
  {
    key: 'fuzhu',
    titleKey: 'progression.qishu.groups.fuzhu',
    items: [
      { key: 'hong_chen_zhang_mu', nameKey: 'progression.items.hong_chen_zhang_mu', icon: `${qishuIconBase}/红尘障目.webp` },
      { key: 'qing_feng_ji_yue', nameKey: 'progression.items.qing_feng_ji_yue', icon: `${qishuIconBase}/清风霁月.webp` },
      { key: 'wu_xiang_jin_shen', nameKey: 'progression.items.wu_xiang_jin_shen', icon: `${qishuIconBase}/无相金身.webp` },
      { key: 'yin_yang_mi_zong_bu', nameKey: 'progression.items.yin_yang_mi_zong_bu', icon: `${qishuIconBase}/阴阳迷踪步.webp` },
      { key: 'yi_e_zhi_ming', nameKey: 'progression.items.yi_e_zhi_ming', icon: `${qishuIconBase}/以鹅之鸣.webp` },
      { key: 'ying_guang_hui_ye', nameKey: 'progression.items.ying_guang_hui_ye', icon: `${qishuIconBase}/荧光晖夜.webp` },
      { key: 'yao_wu_xing', nameKey: 'progression.items.yao_wu_xing', icon: `${qishuIconBase}/杳无形.webp` },
    ],
  },
];

const xinfaItems: ProgressionGroup[] = [
  {
    key: 'xinfa_all',
    titleKey: 'progression.xinfa.groups.default',
    items: [
      { key: 'yi_shui_ge', nameKey: 'progression.items.yi_shui_ge', icon: `${xinfaIconBase}/易水歌.webp` },
      { key: 'hua_shang_yue_ling', nameKey: 'progression.items.hua_shang_yue_ling', icon: `${xinfaIconBase}/花上月令.webp` },
      { key: 'jun_chen_yao', nameKey: 'progression.items.jun_chen_yao', icon: `${xinfaIconBase}/君臣药.webp` },
      { key: 'si_shi_wu_chang', nameKey: 'progression.items.si_shi_wu_chang', icon: `${xinfaIconBase}/四时无常.webp` },
      { key: 'wu_ming_xin_fa', nameKey: 'progression.items.wu_ming_xin_fa', icon: `${xinfaIconBase}/无名心法.webp` },
      { key: 'jian_qi_zong_heng', nameKey: 'progression.items.jian_qi_zong_heng', icon: `${xinfaIconBase}/剑气纵横.webp` },
      { key: 'shan_he_jue_yun', nameKey: 'progression.items.shan_he_jue_yun', icon: `${xinfaIconBase}/山河绝韵.webp` },
      { key: 'wang_chuan_jue_xiang', nameKey: 'progression.items.wang_chuan_jue_xiang', icon: `${xinfaIconBase}/忘川绝响.webp` },
      { key: 'qian_ying_yi_hu', nameKey: 'progression.items.qian_ying_yi_hu', icon: `${xinfaIconBase}/千营一呼.webp` },
      { key: 'shuang_tian_bai_ye', nameKey: 'progression.items.shuang_tian_bai_ye', icon: `${xinfaIconBase}/霜天白夜.webp` },
      { key: 'fu_yao_zhi_shang', nameKey: 'progression.items.fu_yao_zhi_shang', icon: `${xinfaIconBase}/扶摇直上.webp` },
      { key: 'zheng_ren_gui', nameKey: 'progression.items.zheng_ren_gui', icon: `${xinfaIconBase}/征人归.webp` },
      { key: 'nu_zhan_ma', nameKey: 'progression.items.nu_zhan_ma', icon: `${xinfaIconBase}/怒斩马.webp` },
      { key: 'hu_lu_fei_fei', nameKey: 'progression.items.hu_lu_fei_fei', icon: `${xinfaIconBase}/葫芦飞飞.webp` },
      { key: 'chun_lei_pian', nameKey: 'progression.items.chun_lei_pian', icon: `${xinfaIconBase}/春雷篇.webp` },
      { key: 'xing_hua_bu_jian', nameKey: 'progression.items.xing_hua_bu_jian', icon: `${xinfaIconBase}/杏花不见.webp` },
      { key: 'qian_si_gu', nameKey: 'progression.items.qian_si_gu', icon: `${xinfaIconBase}/千丝蛊.webp` },
      { key: 'wei_meng_ge', nameKey: 'progression.items.wei_meng_ge', icon: `${xinfaIconBase}/威猛歌.webp` },
      { key: 'duan_shi_zhi_gou', nameKey: 'progression.items.duan_shi_zhi_gou', icon: `${xinfaIconBase}/断石之构.webp` },
      { key: 'san_qiong_zhi_zhi', nameKey: 'progression.items.san_qiong_zhi_zhi', icon: `${xinfaIconBase}/三穷致知.webp` },
      { key: 'suo_hen_nian_nian', nameKey: 'progression.items.suo_hen_nian_nian', icon: `${xinfaIconBase}/所恨年年.webp` },
      { key: 'gui_yan_jing', nameKey: 'progression.items.gui_yan_jing', icon: `${xinfaIconBase}/归燕经.webp` },
      { key: 'chang_sheng_wu_xiang', nameKey: 'progression.items.chang_sheng_wu_xiang', icon: `${xinfaIconBase}/长生无相.webp` },
      { key: 'po_suo_ying', nameKey: 'progression.items.po_suo_ying', icon: `${xinfaIconBase}/婆娑影.webp` },
      { key: 'ming_hui_tong_chen', nameKey: 'progression.items.ming_hui_tong_chen', icon: `${xinfaIconBase}/明晦同尘.webp` },
      { key: 'dan_xin_zhuan', nameKey: 'progression.items.dan_xin_zhuan', icon: `${xinfaIconBase}/丹心篆.webp` },
      { key: 'qian_shan_fa', nameKey: 'progression.items.qian_shan_fa', icon: `${xinfaIconBase}/千山法.webp` },
      { key: 'liao_yuan_xing_huo', nameKey: 'progression.items.liao_yuan_xing_huo', icon: `${xinfaIconBase}/燎原星火.webp` },
      { key: 'zhu_lang_xin_jing', nameKey: 'progression.items.zhu_lang_xin_jing', icon: `${xinfaIconBase}/逐狼心经.webp` },
      { key: 'yi_jing_yi_wu', nameKey: 'progression.items.yi_jing_yi_wu', icon: `${xinfaIconBase}/移经易武.webp` },
      { key: 'ning_shen_zhang', nameKey: 'progression.items.ning_shen_zhang', icon: `${xinfaIconBase}/凝神章.webp` },
      { key: 'zong_di_zhai_xing', nameKey: 'progression.items.zong_di_zhai_xing', icon: `${xinfaIconBase}/纵地摘星.webp` },
      { key: 'zhi_xuan_pian_zhu', nameKey: 'progression.items.zhi_xuan_pian_zhu', icon: `${xinfaIconBase}/指玄篇注.webp` },
      { key: 'kun_shou_xin_jing', nameKey: 'progression.items.kun_shou_xin_jing', icon: `${xinfaIconBase}/困兽心经.webp` },
      { key: 'kang_zao_da_fa', nameKey: 'progression.items.kang_zao_da_fa', icon: `${xinfaIconBase}/抗造大法.webp` },
      { key: 'pan_shi_jue', nameKey: 'progression.items.pan_shi_jue', icon: `${xinfaIconBase}/磐石诀.webp` },
      { key: 'xin_mi_ni_yu', nameKey: 'progression.items.xin_mi_ni_yu', icon: `${xinfaIconBase}/心弥泥鱼.webp` },
      { key: 'cang_lang_jian_jue', nameKey: 'progression.items.cang_lang_jian_jue', icon: `${xinfaIconBase}/沧浪剑诀.webp` },
      { key: 'sheng_zhou_xing_mu', nameKey: 'progression.items.sheng_zhou_xing_mu', icon: `${xinfaIconBase}/绳舟行木.webp` },
      { key: 'deng_er_liang', nameKey: 'progression.items.deng_er_liang', icon: `${xinfaIconBase}/灯儿亮.webp` },
      { key: 'da_tang_ge', nameKey: 'progression.items.da_tang_ge', icon: `${xinfaIconBase}/大唐歌.webp` },
      { key: 'gu_zhong_bu_ci', nameKey: 'progression.items.gu_zhong_bu_ci', icon: `${xinfaIconBase}/孤忠不辞.webp` },
      { key: 'chuan_hou_jue', nameKey: 'progression.items.chuan_hou_jue', icon: `${xinfaIconBase}/穿喉诀.webp` },
      { key: 'liao_yuan_ta', nameKey: 'progression.items.liao_yuan_ta', icon: `${xinfaIconBase}/燎原踏.webp` },
      { key: 'qin_tian_shi', nameKey: 'progression.items.qin_tian_shi', icon: `${xinfaIconBase}/擒天势.webp` },
      { key: 'tian_xing_jian', nameKey: 'progression.items.tian_xing_jian', icon: `${xinfaIconBase}/天行健.webp` },
      { key: 'ji_le_qi_xue', nameKey: 'progression.items.ji_le_qi_xue', icon: `${xinfaIconBase}/极乐泣血.webp` },
      { key: 'shan_yue_wu_ying', nameKey: 'progression.items.shan_yue_wu_ying', icon: `${xinfaIconBase}/山月无影.webp` },
      { key: 'sheng_long_huo_hu', nameKey: 'progression.items.sheng_long_huo_hu', icon: `${xinfaIconBase}/生龙活虎.webp` },
      { key: 'wan_xue_jian', nameKey: 'progression.items.wan_xue_jian', icon: `${xinfaIconBase}/晚雪间.webp` },
      { key: 'tie_shen_jue', nameKey: 'progression.items.tie_shen_jue', icon: `${xinfaIconBase}/铁身诀.webp` },
      { key: 'sha_bai_wei', nameKey: 'progression.items.sha_bai_wei', icon: `${xinfaIconBase}/沙摆尾.webp` },
    ],
  },
];

const wuxueItems: ProgressionGroup[] = [
  {
    key: 'jichu',
    titleKey: 'progression.wuxue.groups.jichu',
    items: [
      { key: 'shang_hai_jia_cheng', nameKey: 'progression.items.shang_hai_jia_cheng', icon: fallbackIcon },
      { key: 'shou_shang_jian_mian', nameKey: 'progression.items.shou_shang_jian_mian', icon: fallbackIcon },
      { key: 'qi_xue_jia_cheng', nameKey: 'progression.items.qi_xue_jia_cheng', icon: fallbackIcon },
    ],
  },
  {
    key: 'shuxing',
    titleKey: 'progression.wuxue.groups.shuxing',
    items: [
      { key: 'ming_jin_gong_ji_jia_cheng', nameKey: 'progression.items.ming_jin_gong_ji_jia_cheng', icon: fallbackIcon },
      { key: 'lie_shi_gong_ji_jia_cheng', nameKey: 'progression.items.lie_shi_gong_ji_jia_cheng', icon: fallbackIcon },
      { key: 'qian_si_gong_ji_jia_cheng', nameKey: 'progression.items.qian_si_gong_ji_jia_cheng', icon: fallbackIcon },
      { key: 'po_zhu_gong_ji_jia_cheng', nameKey: 'progression.items.po_zhu_gong_ji_jia_cheng', icon: fallbackIcon },
    ],
  },
  {
    key: 'zhize',
    titleKey: 'progression.wuxue.groups.zhize',
    items: [
      { key: 'tu_ji', nameKey: 'progression.items.tu_ji', icon: fallbackIcon },
      { key: 'gu_shou', nameKey: 'progression.items.gu_shou', icon: fallbackIcon },
      { key: 'shen_xing', nameKey: 'progression.items.shen_xing', icon: fallbackIcon },
      { key: 'feng_zu', nameKey: 'progression.items.feng_zu', icon: fallbackIcon },
      { key: 'tong_qiang_tie_bi', nameKey: 'progression.items.tong_qiang_tie_bi', icon: fallbackIcon },
    ],
  },
  {
    key: 'wuxue',
    titleKey: 'progression.wuxue.groups.wuxue',
    items: [
      { key: 'jiu_qu_jing_shen_qiang', nameKey: 'progression.items.jiu_qu_jing_shen_qiang', icon: wuxueIconMap['九曲惊神枪'] || fallbackIcon },
      { key: 'jiu_chong_chun_se', nameKey: 'progression.items.jiu_chong_chun_se', icon: wuxueIconMap['九重春色'] || fallbackIcon },
      { key: 'ba_fang_feng_lei_qiang', nameKey: 'progression.items.ba_fang_feng_lei_qiang', icon: wuxueIconMap['八方风雷枪'] || fallbackIcon },
      { key: 'shi_fang_po_zhen', nameKey: 'progression.items.shi_fang_po_zhen', icon: wuxueIconMap['十方破阵'] || fallbackIcon },
      { key: 'qian_ji_su_tian', nameKey: 'progression.items.qian_ji_su_tian', icon: wuxueIconMap['千机素天'] || fallbackIcon },
      { key: 'qian_xiang_yin_hun_gu', nameKey: 'progression.items.qian_xiang_yin_hun_gu', icon: wuxueIconMap['千香引魂蛊'] || fallbackIcon },
      { key: 'jie_fu_dao_fa', nameKey: 'progression.items.jie_fu_dao_fa', icon: wuxueIconMap['嗟夫刀法'] || fallbackIcon },
      { key: 'tian_zhi_chui_xiang', nameKey: 'progression.items.tian_zhi_chui_xiang', icon: wuxueIconMap['天志垂象'] || fallbackIcon },
      { key: 'zhan_xue_dao_fa', nameKey: 'progression.items.zhan_xue_dao_fa', icon: wuxueIconMap['斩雪刀法'] || fallbackIcon },
      { key: 'wu_ming_jian_fa', nameKey: 'progression.items.wu_ming_jian_fa', icon: wuxueIconMap['无名剑法'] || fallbackIcon },
      { key: 'wu_ming_qiang_fa', nameKey: 'progression.items.wu_ming_qiang_fa', icon: wuxueIconMap['无名枪法'] || fallbackIcon },
      { key: 'ming_chuan_yao_dian', nameKey: 'progression.items.ming_chuan_yao_dian', icon: wuxueIconMap['明川药典'] || fallbackIcon },
      { key: 'ni_li_san_gou', nameKey: 'progression.items.ni_li_san_gou', icon: wuxueIconMap['泥犁三垢'] || fallbackIcon },
      { key: 'ji_ju_jiu_jian', nameKey: 'progression.items.ji_ju_jiu_jian', icon: wuxueIconMap['积矩九剑'] || fallbackIcon },
      { key: 'su_zi_you_chen', nameKey: 'progression.items.su_zi_you_chen', icon: wuxueIconMap['粟子游尘'] || fallbackIcon },
      { key: 'su_zi_xing_yun', nameKey: 'progression.items.su_zi_xing_yun', icon: wuxueIconMap['粟子行云'] || fallbackIcon },
      { key: 'zui_meng_you_chun', nameKey: 'progression.items.zui_meng_you_chun', icon: wuxueIconMap['醉梦游春'] || fallbackIcon },
      { key: 'qing_shan_zhi_bi', nameKey: 'progression.items.qing_shan_zhi_bi', icon: wuxueIconMap['青山执笔'] || fallbackIcon },
    ],
  },
];

export const PROGRESSION_CATEGORIES: ProgressionCategory[] = [
  { id: 'qishu', titleKey: 'progression.categories.qishu', groups: qishuItems },
  { id: 'wuxue', titleKey: 'progression.categories.wuxue', groups: wuxueItems },
  { id: 'xinfa', titleKey: 'progression.categories.xinfa', groups: xinfaItems },
];

export const clampLevel = (value: number, min = 0, max = 20) => Math.max(min, Math.min(max, value));

export const flattenCategoryItems = (category: ProgressionCategory) =>
  category.groups.flatMap((g) => g.items);

export const getCategoryById = (id: ProgressionCategoryId) =>
  PROGRESSION_CATEGORIES.find((c) => c.id === id);
