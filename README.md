# iFrame link card

リンクカードとして表示するためのサイトです。  
iFrame でページに埋め込んで使用します。  
クエリパラメータで`url`を渡すと、対応するページのタイトル・説明・画像・ファビコン・ドメインを取得してカードに整形します。  
Vercel などへデプロイするとすぐに利用開始出来ます。

## Example \ 例

target url: `https://github.com/datsukan/iframe-link-card`

```html
<iframe
  src="http://iframe-link-card.vercel.app/?url=https://github.com/datsukan/iframe-link-card"
  height="150"
  width="100%"
></iframe>
```

![preview image](https://user-images.githubusercontent.com/49118806/161965490-50d98166-8664-42d7-83b6-5b8809013a01.png)

## Framework & Library \ フレームワーク & ライブラリ

- React
- Next.js
- TailwindCSS
- cheerio

## Installation \ 導入

```sh
git clone https://github.com/datsukan/iframe-link-card.git
cd iframe-link-card
yarn install
```

## Usage \ 使用方法

```sh
yarn dev
```

started server `http://localhost:3000`

## Note \ 注意事項

表示をカスタマイズする場合は`components/LinkCard.js`を変更してください。

## Author \ 著者

datsukan

## License \ ライセンス

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
