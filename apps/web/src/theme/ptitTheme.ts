import type { ThemeConfig } from 'antd';

export const ptitTheme: ThemeConfig = {
  token: {
    colorPrimary: '#C62828', // Đỏ PTIT chuẩn
    colorLink: '#C62828',
    colorLinkHover: '#E53935',
    colorSuccess: '#2E7D32',
    colorWarning: '#ED6C02',
    colorError: '#D32F2F',
    colorInfo: '#C62828',
    borderRadius: 6,
    fontFamily: `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    colorBgBase: '#ffffff',
    colorBgLayout: '#f7f7f8',
  },
  components: {
    Button: {
      colorPrimary: '#C62828',
      colorPrimaryHover: '#E53935',
      borderRadius: 4,
    },
    Menu: {
      itemSelectedColor: '#C62828',
      itemSelectedBg: '#FFF1F0',
      itemHoverColor: '#C62828',
    },
    Tabs: {
      itemSelectedColor: '#C62828',
      inkBarColor: '#C62828',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
    },
    Card: {
      headerHeight: 48,
    },
  },
};

