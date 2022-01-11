export default {
  pages: [
    'pages/index/index',
    'pages/chapters/chapters',
    'pages/add/add',
    'pages/detail/detail',
    'pages/export/export',
    'pages/import/import',
    'pages/accounts/list',
    'pages/accounts/add',
    'pages/accounts/edit',
    'pages/accounts/export',
    'pages/accounts/import',
    'pages/platform/list',
    'pages/waiting/list',
    'pages/waiting/form'
  ],
  tabBar: {
    position: 'top',
    list: [
      {pagePath: 'pages/index/index', text: '剧集'},
      {pagePath: 'pages/waiting/list', text: '想看'},
      {pagePath: 'pages/accounts/list', text: '会员'}
    ]
  },
  window: {
    navigationBarTitleText: '追剧小助手',
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black'
  }
}
