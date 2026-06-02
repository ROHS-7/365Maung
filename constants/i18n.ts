export type Lang = "en" | "my";

const translations = {
  en: {
    // Login
    loginSubtitle: "Members Login",
    loginAccountLabel: "Account",
    loginAccountPh: "Enter account name",
    loginPasswordLabel: "Password",
    loginPasswordPh: "Enter password",
    loginRemember: "Remember me",
    loginButton: "Login",
    loginHelp: "Contact us if you need help",

    // Home – profile card
    profileRefresh: "Refresh",
    profileBalance: "Balance",
    profilePhone: "Phone",
    profileCashOut: "Cash Out",
    profileCashCode: "Cash Code",
    sectionMenu: "Sections",

    // Menu items
    menuMixParlay: "Mix Parlay",
    menuHDP: "HDP&O/U",
    menuScore: "Score",
    menuBetList: "Bet List",
    menuDeposit: "Auto Deposit",
    menuWithdraw: "Withdraw",
    menuRule: "Rule",
    menuChangePw: "Change\nPassword",

    // Account tab
    accountTitle: "Account",
    accountBalance: "Balance",
    accountCashCode: "Cash Code",
    accountDeposit: "Auto Deposit",
    accountDepositSub: "Deposit funds",
    accountWithdraw: "Withdraw",
    accountWithdrawSub: "Withdraw funds",
    accountChangePw: "Change Password",
    accountChangePwSub: "Update your password",
    accountRule: "Rule",
    accountRuleSub: "Terms & conditions",
    accountUcenter: "Ucenter",
    accountUcenterSub: "Settings",
    accountLanguage: "Language",
    accountLanguageSub: "App language",
    accountLogout: "Logout",
    accountSectionSettings: "Settings",
    logoutConfirmTitle: "Logout",
    logoutConfirmMsg: "Are you sure you want to logout?",
    logoutCancel: "Cancel",
    logoutConfirm: "Logout",

    // Change password
    changePwTitle: "Change Password",
    changePwSub: "Update your password",
    changePwCurrent: "Password",
    changePwCurrentSub: "Current password",
    changePwNew: "New Password",
    changePwNewSub: "New password",
    changePwConfirm: "Password Confirm",
    changePwConfirmSub: "Confirm new password",
    changePwOK: "OK",
    changePwErrEmpty: "Incomplete",
    changePwErrEmptyMsg: "Please fill in all fields.",
    changePwErrMismatch: "Password mismatch",
    changePwErrMismatchMsg: "New password and confirm must match.",
    changePwErrShort: "Too short",
    changePwErrShortMsg: "Password must be at least 6 characters.",
    changePwSuccess: "Success",
    changePwSuccessMsg: "Password changed successfully.",

    // Rule
    ruleTitle: "Rule",
    ruleSub: "Terms & conditions",

    // Tabs
    tabHome: "Home",
    tabBet: "Bet",
    tabLive: "Live",
    tabScores: "Scores",
    tabAccount: "Account",

    // Bet list screen
    betListTitle: "Bet List",
    betListUnfinished: "Unfinished",
    betListFinished: "Finished",
    betListToday: "Today",
    betListType: "Type",
    betListHdpOu: "HDP & O/U",
    betListPick: "Pick",
    betListLineOdds: "Line / Odds",
    betListStake: "Stake",
    betListTotalOdds: "Total Odds",
    betListPotential: "Potential",
    betListPayout: "Payout",
    betListStkLost: "Stake lost",
    betListPicks: "picks",
    betListEmpty: "No bets found",
    betListEmptySub: "Your bets for this date will appear here",

    // Live screen
    liveTitle: "Live",
    liveEmpty: "No live matches right now",

    // Scores screen
    scoresTitle: "Scores",
    scoresEmpty: "No scores available",

    // Auto Deposit
    autoDepositTitle: "Auto Deposit",
    autoDepositSub: "အော်တိုငွေသွင်းစနစ်",
    bankCard: "bank card",
    viewAccount: "View Account",
    accountNumber: "Account Number",
    accountName: "Account Name",
    autoDepositNote:
      "Minimum 5,000 Kyat deposit required. If you have any issues please contact Customer Service.",
    close: "Close",

    // Home
    announcement: "Minimum bet 500 Kyat, Maximum 20,000 Kyat ✦ ",
    currencyUnit: "Kyat",

    // HDP & O/U
    hdpTitle:        'HDP & O/U',
    hdpLeagues:      'Leagues',
    hdpSelected:     'Selected',
    hdpUnits:        'Units',
    hdpMinErr:       'Select at least 1 pick',
    hdpMinPicksHint: 'Select at least 1 pick to place a bet',
    hdpPlaceBet:     'Place bet',
    hdpReviewBet:    'Review & bet',

    // Mix Parlay
    maungTitle: "Mix Parlay",
    maungOver: "Over",
    maungUnder: "Under",
    maungOdd: "Odd",
    maungEven: "Even",
    maungBetAmount: "Bet",
    maungReset: "Reset",
    maungOK: "OK",
    maungMinErr: "Select at least 2 picks",
    maungMatchDate: "Date",
    maungPicks: "picks",
    maungPlaceBet: "Place bet",
    maungSelected: "Selected",
    maungMinPicksHint: "Select at least 2 matches to place a parlay",
    maungHDP: "HDP",
    maungOU: "O/U",
    maungOE: "O/E",
    maungVs: "vs",
    maungClearSlip: "Clear all",
    maungBetSlip: "Bet slip",
    maungReviewBet: "Review & bet",
    maungTapToExpand: "Tap to review slip",

    // Language picker
    langEnglish: "English",
    langMyanmar: "Myanmar",
  },

  my: {
    // Login
    loginSubtitle: "ကိုဆိုပါတယ်",
    loginAccountLabel: "အကောင့် (Account)",
    loginAccountPh: "အကောင့်နာမည် ထည့်ပါ",
    loginPasswordLabel: "စကားဝှက် (Password)",
    loginPasswordPh: "စကားဝှက် ထည့်ပါ",
    loginRemember: "မှတ်ထားပါ (Remember me)",
    loginButton: "ဝင်ရောက်မည် (Login)",
    loginHelp: "အကူအညီ လိုအပ်ပါက ဆက်သွယ်ပါ",

    // Home – profile card
    profileRefresh: "ငွေဆင်မောင်း",
    profileBalance: "Balance",
    profilePhone: "Phone",
    profileCashOut: "Cash out",
    profileCashCode: "Cash Code",
    sectionMenu: "ကဏ္ဍများ",

    // Menu items
    menuMixParlay: "မောင်း",
    menuHDP: "ဘော်ဒီ",
    menuScore: "ပွဲရလဒ်",
    menuBetList: "လောင်းထားသောပွဲစဉ်",
    menuDeposit: "အော်တိုငွေသွင်းစနစ်",
    menuWithdraw: "ငွေထုတ်ရန်",
    menuRule: "စည်းမျဉ်းစည်းကမ်း",
    menuChangePw: "စကားဝှက် ပြောင်းမည်",

    // Account tab
    accountTitle: "အကောင့်",
    accountBalance: "Balance",
    accountCashCode: "Cash Code",
    accountDeposit: "Auto Deposit",
    accountDepositSub: "ငွေသွင်းရန်",
    accountWithdraw: "Withdraw",
    accountWithdrawSub: "ငွေထုတ်ရန်",
    accountChangePw: "Change Password",
    accountChangePwSub: "စကားဝှက်ပြောင်း",
    accountRule: "Rule",
    accountRuleSub: "စည်းမျဉ်းများ",
    accountUcenter: "Ucenter",
    accountUcenterSub: "ဆက်တင်များ",
    accountLanguage: "Language",
    accountLanguageSub: "ဘာသာစကား",
    accountLogout: "Logout",
    accountSectionSettings: "ဆက်တင်များ",
    logoutConfirmTitle: "Logout",
    logoutConfirmMsg: "ထွက်မည်မှာ သေချာပါသလား?",
    logoutCancel: "မထွက်ဘူး",
    logoutConfirm: "ထွက်မည်",

    // Change password
    changePwTitle: "Change Password",
    changePwSub: "စကားဝှက်ပြောင်းရန်",
    changePwCurrent: "Password",
    changePwCurrentSub: "လက်ရှိ စကားဝှက်",
    changePwNew: "New Password",
    changePwNewSub: "စကားဝှက်အသစ်",
    changePwConfirm: "Password Confirm",
    changePwConfirmSub: "စကားဝှက် အတည်ပြုပါ",
    changePwOK: "OK",
    changePwErrEmpty: "အချက်အလက် မပြည့်စုံ",
    changePwErrEmptyMsg: "ကျေးဇူးပြု၍ အကွက်အားလုံး ဖြည့်ပါ။",
    changePwErrMismatch: "စကားဝှက် မတူညီ",
    changePwErrMismatchMsg: "စကားဝှက်အသစ် နှင့် အတည်ပြုစကားဝှက် တူညီရမည်။",
    changePwErrShort: "စကားဝှက် တိုလွန်း",
    changePwErrShortMsg: "စကားဝှက်အသစ် အနည်းဆုံး ၆ လုံး ထည့်ပါ။",
    changePwSuccess: "အောင်မြင်သည်",
    changePwSuccessMsg: "စကားဝှက် ပြောင်းလဲပြီးပါပြီ။",

    // Rule
    ruleTitle: "Rule",
    ruleSub: "စည်းမျဉ်းများ",

    // Tabs
    tabHome: "Home",
    tabBet: "Bet",
    tabLive: "Live",
    tabScores: "Scores",
    tabAccount: "Account",

    // Bet list screen
    betListTitle: "လောင်းစာရင်း",
    betListUnfinished: "မပြီးဆုံးသေး",
    betListFinished: "ပြီးဆုံးသော",
    betListToday: "ယနေ့",
    betListType: "အမျိုးအစား",
    betListHdpOu: "ဘော်ဒီ & ကျော်/မမီ",
    betListPick: "ရွေးချယ်မှု",
    betListLineOdds: "လိုင်း / အနှုန်း",
    betListStake: "လောင်းငွေ",
    betListTotalOdds: "စုစုပေါင်း အနှုန်း",
    betListPotential: "ရနိုင်သောငွေ",
    betListPayout: "ပေးငွေ",
    betListStkLost: "လောင်းငွေ ဆုံးရှုံး",
    betListPicks: "ပွဲ",
    betListEmpty: "လောင်းကစားစာရင်း မရှိသေးပါ",
    betListEmptySub: "ဤနေ့၏ လောင်းကြေးများ ဤနေရာတွင် ပေါ်လာမည်",

    // Live screen
    liveTitle: "Live",
    liveEmpty: "Live ပွဲများ မရှိသေးပါ",

    // Scores screen
    scoresTitle: "Scores",
    scoresEmpty: "ရလဒ်များ မရှိသေးပါ",

    // Auto Deposit
    autoDepositTitle: "အော်တိုငွေသွင်းစနစ်",
    autoDepositSub: "Auto Deposit",
    bankCard: "bank card",
    viewAccount: "အကောင့်ကြည့်ရန်",
    accountNumber: "အကောင့်နံပါတ်",
    accountName: "အကောင့်အမည်",
    autoDepositNote:
      "အနည်းဆုံး 5000 ကျပ် ငွေသွင်းရပါမည်။ အဆက်အသွယ် တရာ ရှိပါက Customer Service သို့ ဆက်သွယ်ပေးပါ",
    close: "ပိတ်မည်",

    // Home
    announcement:
      "၆ ပါ) မောင်းများကို အနည်းဆုံး (500) ကျပ်မှ အများဆုံး (20,000) ကျပ် ✦ ",
    currencyUnit: "ကျပ်",

    // HDP & O/U
    hdpTitle:        'ဘော်ဒီ',
    hdpLeagues:      'လိဂ်များ',
    hdpSelected:     'ရွေးထားသော',
    hdpUnits:        'ယူနစ်',
    hdpMinErr:       'အနည်းဆုံး ၁ ပွဲ ရွေးပါ',
    hdpMinPicksHint: 'အနည်းဆုံး ၁ ပွဲ ရွေးပြီး လောင်းပါ',
    hdpPlaceBet:     'လောင်းမည်',
    hdpReviewBet:    'စစ်ဆေးပြီး လောင်းမည်',

    // Mix Parlay
    maungTitle: "မောင်း",
    maungOver: "ဂိုးပေါ်",
    maungUnder: "ဂိုးအောက်",
    maungOdd: "မ",
    maungEven: "စုံ",
    maungBetAmount: "လောင်းငွေ",
    maungReset: "ဖျက်မည်",
    maungOK: "OK",
    maungMinErr: "အနည်းဆုံး ၂ ပွဲ ရွေးပါ",
    maungMatchDate: "ပွဲစချိန်",
    maungPicks: "ပွဲ",
    maungPlaceBet: "လောင်းမည်",
    maungSelected: "ရွေးထားသည်",
    maungMinPicksHint: "ပွဲ ၂ ပွဲ အနည်းဆုံး ရွေးပြီး မောင်း လောင်းပါ",
    maungHDP: "ဘော်ဒီ",
    maungOU: "ဂိုးပေါ်/အောက်",
    maungOE: "မ/စုံ",
    maungVs: "vs",
    maungClearSlip: "အားလုံးဖျက်",
    maungBetSlip: "လောင်းစာရင်း",
    maungReviewBet: "စစ်ဆေးပြီး လောင်းမည်",
    maungTapToExpand: "စာရင်းကြည့်ရန် နှိပ်ပါ",

    // Language picker
    langEnglish: "English",
    langMyanmar: "မြန်မာ",
  },
} as const;

export type Translations = typeof translations.en;
export default translations;
