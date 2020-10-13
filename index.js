const amazonPaapi = require('amazon-paapi');
const dotenv      = require('dotenv');

dotenv.config();

const commonParameters = {
  AccessKey  : process.env.ACCESS_KEY,
  SecretKey  : process.env.SECRET_KEY,
  PartnerTag : process.env.PARTNER_TAG,
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.co.jp'
};
//console.log(commonParameters);

(async () => {
  try {
    const data = await amazonPaapi.SearchItems(commonParameters, {
      Keywords   : 'ウェブデザイン',
      SearchIndex: 'Books',  // 'All'
      ItemCount  : 5,
      Resources  : [
        'ItemInfo.Title',
        'Images.Primary.Medium',
        'Images.Primary.Large',
        'Offers.Listings.Price'
      ]
    });
    
    console.log(`Search URL : ${get(data, 'SearchResult.SearchURL') || '検索 URL 不明'}`);
    //console.log(JSON.stringify(data, null, '  '));
    // {
    //   SearchResult: {
    //     TotalResultCount: 1200,
    //     SearchURL: 'https://www.amazon.co.jp/s?k=Harry+Potter&i=stripbooks&rh=p_n_availability%3A-1&tag=XXXXX-22&linkCode=osi',
    //     Items: [ [exports], [exports], [exports] ]
    //   }
    // }
    
    if(get(data, 'SearchResult.Items')) {
      data.SearchResult.Items.forEach((item, index) => {
        console.log(index, {
          asin         : item.ASIN                                || 'ASIN 不明' ,
          detailPageUrl: item.DetailPageURL                       || 'URL 不明'  ,
          title        : get(item, 'ItemInfo.Title.DisplayValue') || '商品名不明',
          imageUrl     : get(item, 'Images.Primary.Medium.URL')    || '画像 URL 不明',
          imageWidth   : get(item, 'Images.Primary.Medium.Width')  || '画像幅不明'   ,
          imageHeight  : get(item, 'Images.Primary.Medium.Height') || '画像高さ不明' ,
          largeImageUrl   : get(item, 'Images.Primary.Large.URL')    || 'Large 画像 URL 不明',
          largeImageWidth : get(item, 'Images.Primary.Large.Width')  || 'Large 画像幅不明'   ,
          largeImageHeight: get(item, 'Images.Primary.Large.Height') || 'Large 画像高さ不明' ,
          price: get(item, 'Offers.Listings.0.Price.DisplayAmount') || '価格不明'
        });
        // DetailPageURL はこういう URL ではないのねん : https://www.amazon.co.jp/exec/obidos/ASIN/B07L15R7V9/XXXXX-22/
        // {
        //   ASIN: '1408856778',
        //   DetailPageURL: 'https://www.amazon.co.jp/dp/1408856778?tag=XXXXX-22&linkCode=osi&th=1&psc=1',
        //   ItemInfo: {
        //     Title: {
        //       DisplayValue: "Harry Potter Children's Collection",
        //       Label: 'Title',
        //       Locale: 'ja_JP'
        //     }
        //   },
        //   Images: {
        //     Primary: {
        //       Medium: {
        //         URL: "https://m.media-amazon.com/images/I/419aN3uO+YL._SL160_.jpg",
        //         Height: 160,
        //         Width: 160
        //       }
        //     }
        //   },
        //   Offers: {
        //     Listings: [
        //       {
        //         Id: "xxx",
        //         Price: {
        //           Amount: 2999,
        //           Currency: "JPY",
        //           DisplayAmount: "￥2,999",
        //           Savings: {
        //             Amount: 1700,
        //             Currency: "JPY",
        //             DisplayAmount: "￥1,700 (36%)",
        //             Percentage: 36
        //           }
        //         },
        //         ViolatesMAP: false
        //       }
        //     ]
        //   }
        // }
      });
    }
    
    console.log('END');
  }
  catch(error) {
    console.error('ERROR :\n', error, '\nERROR');
    
    // この場合はリトライしたい
    if(error.status === 429) {
      console.error('Error : TooManyRequests');
    }
  }
})();


/** ネストされた連想配列を辿って値を取得する */
function get(object, path) {
  let lookup = Object.assign({}, object);
  const keys = `${path}`.split('.');
  const length = keys.length;
  for(let index = 0; index < length; index++) {
    if(lookup[keys[index]] == null) {
      return index === length - 1 ? lookup[keys[index]] : undefined;
    }
    lookup = lookup[keys[index]];
  }
  return lookup;
}
