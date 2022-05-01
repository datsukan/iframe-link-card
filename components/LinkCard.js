export const LinkCard = ({ title, description, siteUrl, domain, imageUrl }) => {
  return (
    <a href={siteUrl} target="_blank" rel="noopener noreferrer">
      <div className="h-32 w-full max-w-4xl rounded-lg border border-gray-300 flex overflow-hidden group hover:bg-gray-100 bg-white">
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="text-lg font-bold line-clamp-2 break-all">
              {title ?? siteUrl}
            </p>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${siteUrl}`}
              className="w-4 h-4"
              alt="favicon"
            />
            <span className="text-xs">{domain}</span>
          </div>
        </div>
        {imageUrl && (
          <div className="h-full aspect-square sm:aspect-auto group-hover:mix-blend-multiply">
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt="site image"
            />
          </div>
        )}
      </div>
    </a>
  )
}
