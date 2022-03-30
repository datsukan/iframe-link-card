import * as cheerio from "cheerio"
import { LinkCard } from "@components/LinkCard"

const sampleProps = {
  title:
    "タイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトルタイトル",
  description: "説明文です説明文です説明文です説明文です",
  siteUrl: "https://blog.datsukan.me/",
  domain: "blog.datsukan.me",
  imageUrl:
    "https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43",
}

export default function Home(props) {
  return <LinkCard {...props} />
}

export const getServerSideProps = async context => {
  const { url = null } = context.query
  const props = url ? await getOGP(url) : sampleProps

  return { props: { ...props } }
}

async function getOGP(url) {
  // バリデーション
  if (!url || url.length === 0 || typeof url !== "string") {
    return null
  }
  if (url.indexOf("https://") !== 0 && url.indexOf("https://") !== 0) {
    return null
  }

  const data = await fetch(url)
  const props = extractOGP(await data.text())

  if (!props) return null

  props.siteUrl = url
  props.domain = url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1]

  return props
}

function extractOGP(html) {
  const $ = cheerio.load(html)
  const title = $("meta[property='og:title']").attr("content")
  const description = $("meta[property='og:description']").attr("content")
  const imageUrl = $("meta[property='og:image']").attr("content")

  const ogp = {
    title: title ?? null,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
  }

  return ogp
}
