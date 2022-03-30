export const LinkCard = ({ title, description, siteUrl, domain, imageUrl }) => {
  return (
    <div className="h-32 w-full rounded-lg ring-1 ring-gray-300 flex overflow-hidden hover:bg-sky-50/40">
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <p className="text-lg font-bold line-clamp-2">{title}</p>
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
      <div className="h-full aspect-square sm:aspect-auto">
        <img
          src={imageUrl}
          className="w-full h-full object-cover"
          alt="site image"
        />
      </div>
    </div>
  )
}
