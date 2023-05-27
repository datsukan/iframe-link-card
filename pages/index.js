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
  if (!url || url.length === 0 || typeof url !== "string") {
    return null
  }
  if (url.indexOf("https://") !== 0 && url.indexOf("https://") !== 0) {
    return null
  }

  const response = await axios.get(url, { maxRedirects: 10 })
  const props = extractOGP(response.data)

  if (!props) return null

  props.siteUrl = response.request.res.responseUrl
  props.domain = props.siteUrl.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1]

  return props
}

function extractOGP(html) {
  const $ = cheerio.load(html)
  let title, description, imageUrl
  title = $("meta[property='og:title']").attr("content")
  description = $("meta[property='og:description']").attr("content")
  imageUrl = $("meta[property='og:image']").attr("content")

  if (!title && !description && !imageUrl) {
    // Amazon
    title = $("#productTitle").text()
    description = $("#feature-bullets").text()
    imageUrl = $("#landingImage").attr("src")
  }

  const ogp = {
    title: title ?? null,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
  }

  return ogp
}
