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
  let title, description, imageUrl
  ;[title, description, imageUrl] = extractNormalOGP($)
  if (title && description && imageUrl) {
    return [title, description, imageUrl]
  }

  ;[title, description, imageUrl] = extractAmazonOGP($)
  return [title, description, imageUrl]
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
