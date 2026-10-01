import axios from "axios"
import * as cheerio from "cheerio"
import { LinkCard } from "@components/LinkCard"

const sampleProps = {
  title:
    "タイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトル",
  description: "説明文です説明文です説明文です説明文です",
  siteUrl: "https://example.com/",
  domain: "example.com",
  imageUrl:
    "https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43",
}

export default function Home(props) {
  return <LinkCard {...props} />
}

const MAX_CACHE_SIZE = 1000
const REQUEST_TIMEOUT = 5000
const cache = {}

export const getServerSideProps = async context => {
  const { url = null } = context.query

  if (!url) {
    return { props: { ...sampleProps } }
  }

  if (cache[url]) {
    return { props: { ...cache[url] } }
  }

  const ogp = await getOGP(url)

  // キャッシュサイズが上限に達している場合、最も古いエントリを削除
  if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
    const oldestKey = Object.keys(cache)[0]
    delete cache[oldestKey]
  }

  cache[url] = ogp

  return { props: { ...ogp } }
}

async function getOGP(url) {
  // バリデーション
  if (!url || typeof url !== "string" || url.length === 0) {
    return {}
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return {
      title: null,
      description: null,
      imageUrl: null,
      siteUrl: url,
      domain: url,
    }
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      title: null,
      description: null,
      imageUrl: null,
      siteUrl: url,
      domain: parsedUrl.hostname,
    }
  }

  let response
  try {
    response = await axios.get(url, {
      maxRedirects: 5,
      timeout: REQUEST_TIMEOUT,
      maxContentLength: 2 * 1024 * 1024,
      // axiosのデフォルトUAだと応答を返さないサイトがあるため明示する
      // ブラウザのUAを装うとAmazonでボット判定されるため、compatible形式にする
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iframe-link-card/1.0)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    })
  } catch {
    return {
      title: null,
      description: null,
      imageUrl: null,
      siteUrl: url,
      domain: parsedUrl.hostname,
    }
  }

  const [title, description, imageUrl] = extractOGP(response.data)

  const siteUrl = response.request?.res?.responseUrl ?? url
  const domain = new URL(siteUrl).hostname

  return {
    title: title ?? null,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
    siteUrl: siteUrl,
    domain: domain,
  }
}

function extractOGP(html) {
  const $ = cheerio.load(html)
  const normal = extractNormalOGP($)
  if (normal.every(Boolean)) {
    return normal
  }

  // 一部が取得できなかった場合は、取得済みの値を優先して不足分のみ補完する
  const amazon = extractAmazonOGP($)
  const fallback = [
    $("title").text(),
    $("meta[name='description']").attr("content"),
    undefined,
  ]
  return normal.map((value, i) =>
    [value, amazon[i], fallback[i]].map(v => v?.trim()).find(Boolean)
  )
}

// 一般的なOGP情報を抽出する
function extractNormalOGP($) {
  const title = $("meta[property='og:title']").attr("content")
  const description = $("meta[property='og:description']").attr("content")
  const imageUrl = $("meta[property='og:image']").attr("content")

  return [title, description, imageUrl]
}

// Amazon商品ページのOGP情報を抽出する
function extractAmazonOGP($) {
  let title, description, imageUrl

  title = $("#productTitle").text()
  description = $("#feature-bullets").text()
  imageUrl = $("#landingImage").attr("src")
  if (imageUrl) {
    return [title, description, imageUrl]
  }

  // 書籍
  // 紙
  imageUrl = $("#imgBlkFront").attr("src")
  if (imageUrl) {
    return [title, description, imageUrl]
  }

  // 電子
  imageUrl = $("#ebooksImgBlkFront").attr("src")
  return [title, description, imageUrl]
}
