export type NewsCategory =
  | 'premier-league'
  | 'la-liga'
  | 'serie-a'
  | 'bundesliga'
  | 'champions-league'
  | 'transfer';

export type NewsArticle = {
  id: string;
  category: NewsCategory;
  titleEn: string;
  titleMy: string;
  summaryEn: string;
  summaryMy: string;
  bodyEn: string[];
  bodyMy: string[];
  imageUrl: string;
  authorEn: string;
  authorMy: string;
  publishedAt: string;
  views: number;
  likes: number;
  featured?: boolean;
  readMinutes: number;
};

export const NEWS_CATEGORY_LABELS: Record<
  NewsCategory,
  { en: string; my: string }
> = {
  'premier-league': { en: 'Premier League', my: 'ပရီမီယာလိဂ်' },
  'la-liga': { en: 'La Liga', my: 'လာလီဂါ' },
  'serie-a': { en: 'Serie A', my: 'ဆီးရီးအေ' },
  bundesliga: { en: 'Bundesliga', my: 'ဘွန်းဒက်လိဂ်' },
  'champions-league': { en: 'Champions League', my: 'ချန်ပီယံလိဂ်' },
  transfer: { en: 'Transfers', my: 'ကစားသမားရွှေ့ပြောင်း' },
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    category: 'premier-league',
    featured: true,
    titleEn: 'Arsenal extend lead at top with late winner at Emirates',
    titleMy: 'အာဆင်နယ်သည် အီမီရိတ်စ်တွင် နောက်ဆုံးမိနစ်ဂိုးဖြင့် ထိပ်တန်းတွင် ဦးဆောင်နေဆဲ',
    summaryEn:
      'A dramatic 89th-minute strike sealed three points as the Gunners keep pressure on rivals in the title race.',
    summaryMy:
      '၈၉ မိနစ်တွင် အရေးကြီးဂိုးဖြင့် အနိုင်ရရှိပြီး ခေါင်းဆောင်အပြိုင်ပွဲတွင် ဖိအားဆက်ရှိနေသည်။',
    bodyEn: [
      'Arsenal came from behind to beat a resilient opponent 2-1 at the Emirates Stadium on Saturday evening, extending their advantage at the summit of the Premier League table.',
      'The visitors took a shock lead through a well-worked counter-attack in the 34th minute, silencing the home crowd. Mikel Arteta\'s side responded with increased intensity after the break, equalising through a deflected strike before the winner arrived in stoppage time.',
      'Speaking after the match, Arteta praised his squad\'s mentality: "We never stopped believing. The fans pushed us over the line."',
      'The result leaves Arsenal three points clear with a game in hand, setting up a pivotal midweek fixture against one of their closest challengers.',
    ],
    bodyMy: [
      'အာဆင်နယ်သည် စနေညနေက အီမီရိတ်စ်အားကောင်းကွင်းတွင် ၂-၁ ဖြင့် အနိုင်ရရှိပြီး ပရီမီယာလိဂ် ဇယားထိပ်တွင် ဦးဆောင်မှုကို ဆက်လက်ထိန်းသိမ်းထားသည်။',
      'ဧည့်သည်အသင်းသည် ၃၄ မိနစ်တွင် ကောင်းမွန်သော ကောင်တာတိုက်စစ်ဖြင့် ဦးဆောင်ဂိုးရရှိစေခဲ့သည်။ နောက်ပိုင်းတွင် အားကောင်းမှုဖြင့် ညီမျှဂိုးရပြီး နောက်ဆုံးမိနစ်တွင် အနိုင်ဂိုးရရှိခဲ့သည်။',
      'ပွဲပြီးနောက် အာတေတာသည် အသင်းဝင်များ၏ စိတ်ဓာတ်ကို ချီးမွမ်းခဲ့သည် — "ယုံကြည်မှုကို မရပ်တန့်ခဲ့ကြပါ။ ပရိသတ်က ကျွန်ုပ်တို့ကို တွန်းအားပေးခဲ့သည်။"',
      'ဤရလဒ်ဖြင့် အာဆင်နယ်သည် တစ်ပွဲပိုကျန်ရှိချိန် ၃ မှတ်ဖြင့် ဦးဆောင်နေပြီး အရေးကြီးသော အလယ်ပတ်ပွဲကို မျှော်လင့်နိုင်သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    authorEn: 'Sports Desk',
    authorMy: 'အားကစားသတင်းဌာန',
    publishedAt: '2026-06-02T08:30:00Z',
    views: 48200,
    likes: 3180,
    readMinutes: 4,
  },
  {
    id: '2',
    category: 'la-liga',
    titleEn: 'Real Madrid confirm return of star midfielder after injury layoff',
    titleMy: 'ရီးယားလ်မက်ဒရစ် ကြယ်ပွင့်မီဒ်ဖီလ်ဒာ ပြန်လည်ကစားရန် အတည်ပြု',
    summaryEn:
      'The Spanish giants receive a major boost ahead of the Champions League knockout stage.',
    summaryMy:
      'ချန်ပီယံလိဂ် နောက်ပိုင်းပွဲစဉ်မတိုင်မီ အသင်းအတွက် အရေးကြီးသော အားဖြည့်မှုရရှိသည်။',
    bodyEn: [
      'Real Madrid have announced that their midfield maestro will return to full training this week following a six-week absence.',
      'The player sustained a hamstring injury during international duty but has completed his rehabilitation programme ahead of schedule.',
      'Carlo Ancelotti suggested he could feature in the squad as early as the weekend, though minutes will be managed carefully.',
    ],
    bodyMy: [
      'ရီးယားလ်မက်ဒရစ်သည် ခြေတွင်းကြွက်အကျပ်ဒဏ်ရာမှ ခြောက်ပတ်အကြာ ပျက်ကွက်ပြီးနောက် ယခုအပတ်တွင် အပြည့်အဝ လေ့ကျင့်ခန်းပြန်လည်လုပ်ဆောင်မည်ဟု ကြေညာခဲ့သည်။',
      'နိုင်ငံတကာပွဲစဉ်တွင် ဒဏ်ရာရရှိခဲ့သော်လည်း ပရိုဂရမ်ကို အချိန်မီ ပြီးမြောက်နိုင်ခဲ့သည်။',
      'အန်ဆယ်လိုတီသည် စနေနေ့ပွဲတွင် အသင်းသို့ပါဝင်နိုင်သည်ဟု ညွှန်ပြသော်လည်း ကစားချိန်ကို သတိထားမည်ဖြစ်သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    authorEn: 'Madrid Correspondent',
    authorMy: 'မက်ဒရစ်သတင်းထောက်',
    publishedAt: '2026-06-01T14:15:00Z',
    views: 29100,
    likes: 2104,
    readMinutes: 3,
  },
  {
    id: '3',
    category: 'transfer',
    titleEn: 'Premier League club agree record fee for Brazilian forward',
    titleMy: 'ပရီမီယာလိဂ်အသင်းသည် ဘရာဇီးလ်တိုက်စစ်မှူးအတွက် မှတ်တမ်းတင်ကြေးပေးချေမှု',
    summaryEn:
      'Medical scheduled for midweek as the deal edges closer to completion, sources say.',
    summaryMy:
      'စာချုပ်ပြီးမြောက်ရန် နီးစပ်လာပြီး အလယ်ပတ်တွင် ဆေးစစ်မှု စီစဉ်ထားသည်ဟု ရင်းမြစ်များဆို။',
    bodyEn: [
      'One of England\'s biggest clubs have reached an agreement in principle for a club-record transfer fee, according to multiple reports on Monday.',
      'The 24-year-old forward has scored 28 goals across all competitions this season and was the subject of interest from several European sides.',
      'Personal terms are not expected to be an obstacle, with the player keen on a new challenge in the Premier League.',
    ],
    bodyMy: [
      'အင်္ဂလန်အကြီးစားအသင်းတစ်သင်းသည် မှတ်တမ်းတင်ကြေးဖြင့် သဘောတူညီမှုရရှိပြီဟု တနင်္လာနေ့ သတင်းများဆိုသည်။',
      '၂၄ နှစ်အရွယ် တိုက်စစ်မှူးသည် ယခုရာသီတွင် ပွဲစဉ်အားလုံးတွင် ဂိုး ၂၈ ဂိုးသွင်းထားပြီး ဥရောပအသင်းများစွာမှ စိတ်ဝင်စားမှုခံခဲ့ရသည်။',
      'ပရီမီယာလိဂ်တွင် စိန်ခေါှုအသစ်ကို လိုလားသောကြောင့် ကိုယ်ပိုင်သဘောတူညီချက်သည် အတားအဆီးမဖြစ်ဟု မျှော်လင့်ရသည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    authorEn: 'Transfer Live',
    authorMy: 'Transfer Live',
    publishedAt: '2026-06-01T09:00:00Z',
    views: 67400,
    likes: 4521,
    readMinutes: 3,
  },
  {
    id: '4',
    category: 'serie-a',
    titleEn: 'Inter Milan clinch Coppa Italia with penalty shootout drama',
    titleMy: 'အင်တာမီလန်သည် ပင်နာတီပွဲဖြင့် ကိုပါ အီတလီယာအဖွဲ့ဝင်ရ',
    summaryEn:
      'Ten-goal thriller over two legs ends with the Nerazzurri lifting silverware at the Olimpico.',
    summaryMy:
      'နှစ်ပွဲစဉ်တွင် ဂိုး ၁၀ ဂိုးဖြင့် နာရာဇူရီအဖွဲ့ ချီးမြှင့်ခံရသည်။',
    bodyEn: [
      'Inter Milan won the Coppa Italia on penalties after a breathtaking 3-3 draw in the second leg of the final.',
      'The match had everything: a comeback, a controversial VAR decision, and a goalkeeper saving the decisive spot-kick.',
      'Fans flooded the streets of Milan late into the night celebrating the club\'s first domestic cup in three seasons.',
    ],
    bodyMy: [
      'အင်တာမီလန်သည် ဖိုင်နယ်ဒုတိယပွဲ ၃-၃ ချေမှုနိတ်ပြီးနောက် ပင်နာတီဖြင့် ကိုပါ အီတလီယာအဖွဲ့ဝင်ရရှိခဲ့သည်။',
      'ပွဲတွင် ပြန်လည်အနိုင်ရခြင်း၊ VAR ဆုံးဖြတ်ချက်နှင့် ဂိုးသမားက အရေးကြီးပင်နာတီကာကွယ်မှု ပါဝင်ခဲ့သည်။',
      'မီလန်မြို့လမ်းများတွင် ပရိသတ်များသည် နာရီအတော်ကြာ ဂုဏ်ပြုခဲ့သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1489944440615-453fc2eb73b6?w=800&q=80',
    authorEn: 'Serie A Weekly',
    authorMy: 'Serie A Weekly',
    publishedAt: '2026-05-31T20:45:00Z',
    views: 19800,
    likes: 1422,
    readMinutes: 4,
  },
  {
    id: '5',
    category: 'bundesliga',
    titleEn: 'Bayern Munich appoint new sporting director amid squad rebuild',
    titleMy: 'ဘိုင်ယန်မွန်ချ်သည်င်းပြန်လည်တည်ဆောက်မှုအတွက် အားကစားဒါရိုက်တာသစ် ခန့်အပ်',
    summaryEn:
      'The Bundesliga champions look to refresh their recruitment strategy before the summer window.',
    summaryMy:
      'နွေရာသီရွှေ့ပြောင်းချိန်မတိုင်မီ ခေါ်ယူမှုမဟာဗျူဟာကို ပြန်လည်သတ်မှတ်ရန် ရည်ရွယ်။',
    bodyEn: [
      'Bayern Munich have confirmed the appointment of a new sporting director, ending weeks of speculation in the German press.',
      'The incoming executive is known for developing young talent and has previously worked with several national team coaches.',
      'Club CEO Oliver Kahn said the move reflects a long-term vision rather than short-term fixes.',
    ],
    bodyMy: [
      'ဘိုင်ယန်မွန်ချ်သည် အားကစားဒါရိုက်တာသစ်ကို ခန့်အပ်ကြောင်း အတည်ပြုပြီး ဂျာမန်သတင်းများတွင် အပတ်များစွာ ခန့်မှန်းချက်များကို အဆုံးသတ်ခဲ့သည်။',
      'အသစ်ရောက်ရှိလာမည့် အမှုဆောင်သည် လူငယ်အရည်အချင်းများကို ဖွံ့ဖြိုးစေခြင်းနှင့် အမျိုးသားအသင်းနည်းပြများနှင့် ပူးပေါင်းအတွေ့အကြုံရှိသည်။',
      'ကလပ်ခ်အမှုဆောင်ချုပ်က ရေရှည်အမြင်ကို ရည်ရွယ်ကြောင်း ပြောကြားခဲ့သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    authorEn: 'Bundesliga Now',
    authorMy: 'Bundesliga Now',
    publishedAt: '2026-05-31T11:20:00Z',
    views: 12400,
    likes: 687,
    readMinutes: 3,
  },
  {
    id: '6',
    category: 'champions-league',
    titleEn: 'UEFA announce format tweaks for 2026/27 Champions League',
    titleMy: 'ယးအက်ဖေအေ ၂၀၂၆/၂၇ ချန်ပီယံလိဂ်ပုံစံအသစ် ကြေညာ',
    summaryEn:
      'Additional knockout round and adjusted seeding rules headline the reforms.',
    summaryMy:
      'နောက်ပိုင်းပွဲစဉ်အပိုနှင့် မျိုးရိုးစဉ်ဆက်မပြတ်စည်းမျဉ်းများ ပြုပြင်မည်။',
    bodyEn: [
      'UEFA have outlined several changes to the Champions League format starting from the 2026/27 season, following consultation with clubs and broadcast partners.',
      'An extra knockout play-off round will be introduced, while seeding for the league phase will place greater emphasis on domestic performance.',
      'Fans\' groups welcomed increased competitive balance but called for ticket price caps to remain a priority.',
    ],
    bodyMy: [
      'ယးအက်ဖေအေသည် ၂၀၂၆/၂၇ ရာသီမှစတင်၍ ချန်ပီယံလိဂ်ပုံစံပြောင်းလဲမှုများကို ကလပ်များနှင့် ထုတ်လွှင့်ရေးလုပ်ဖော်ကိုင်များနှင့် တိုင်ပင်ဆွေးနွေးပြီးနောက် ကြေညာခဲ့သည်။',
      'နောက်ပိုင်းပွဲစဉ်အပိုတစ်ခု ထည့်သွင်းမည်ဖြစ်ပြီး လိဂ်အဆင့်တွင် ပြည်တွင်းရလဒ်ကို ပိုမိုထည့်သွင်းစဉ်းစားမည်။',
      'ပရိသတ်အဖွဲ့အစည်းများသည် ပြိုင်ဆိုင်မှုညီမျှမှုကို ကြိုဆိုသော်လည်း လက်မှတ်ဈေးနှုန်းထိန်းချုပ်မှုကို ဆက်လက်တောင်းဆိုခဲ့သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    authorEn: 'Europe Football',
    authorMy: 'Europe Football',
    publishedAt: '2026-05-30T16:00:00Z',
    views: 35600,
    likes: 1890,
    readMinutes: 5,
  },
  {
    id: '7',
    category: 'premier-league',
    titleEn: 'Liverpool star signs contract extension until 2030',
    titleMy: 'လီဗာပူးကွယ်ကစားသမား ၂၀၃၀ အထိ စာချုပ်တိုးမြှင့်',
    summaryEn:
      'The Reds secure their talisman as rivals circle ahead of the transfer window.',
    summaryMy:
      'ရွှေ့ပြောင်းချိန်မတိုင်မီ ပြိုင်ဘက်များဝိုင်းရံမှုကြားတွင် အဓိကကစားသမားကို ထိန်းသိမ်းရရှိ။',
    bodyEn: [
      'Liverpool have tied their leading goalscorer to a new long-term deal, ending months of speculation about his future.',
      'The player said he feels "at home" on Merseyside and wants to add more trophies before considering a move abroad.',
      'Manager Arne Slot hailed the commitment as a statement of intent for the club\'s next chapter.',
    ],
    bodyMy: [
      'လီဗာပူးသည် ဦးဆောင်ဂိုးသွင်းသူကို ရေရှည်စာချုပ်ဖြင့် ချည်နှောင်ပြီး အနာဂတ်အကြောင်း ခန့်မှန်းချက်များကို အဆုံးသတ်ခဲ့သည်။',
      'ကစားသမားသည် မက်ရ်ဆိုက်တွင် အိမ်တွင်းလိုခံစားရပြီး နိုင်ငံခြားပြောင်းရွှေ့မီ ဆုများထပ်မံရရှိလိုကြောင်း ပြောကြားခဲ့သည်။',
      'နည်းပြသည် ဤကတိကဝတ်ကို ကလပ်၏ နောက်အခန်းအတွက် ရည်ရွယ်ချက်အဖြစ် ချီးမွမ်းခဲ့သည်။',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
    authorEn: 'Anfield Report',
    authorMy: 'Anfield Report',
    publishedAt: '2026-05-30T10:30:00Z',
    views: 41200,
    likes: 3655,
    readMinutes: 3,
  },
];

export function getNewsArticle(id: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find(a => a.id === id);
}

export function getRelatedArticles(id: string, limit = 4): NewsArticle[] {
  const current = getNewsArticle(id);
  if (!current) return NEWS_ARTICLES.filter(a => a.id !== id).slice(0, limit);
  return NEWS_ARTICLES.filter(
    a => a.id !== id && a.category === current.category,
  )
    .concat(NEWS_ARTICLES.filter(a => a.id !== id && a.category !== current.category))
    .slice(0, limit);
}
