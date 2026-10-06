export function VideoTestimonials() {
  return (
    <section className="content-container pt-48 md:pt-56 pb-16 md:pb-24">
      <div className="space-y-12">
        {/* Video Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-sand-light">
          <video
            src="https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/site--testimonials-video-01M48HQXM4X1G83Z4TSKMT69NM.mp4"
            poster="https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/site--testimonials-video-still-01M48H5WAJKT8FP7FCYEV6Y4CF.webp"
            className="h-full w-full object-cover scale-125"
            controls
            playsInline
          />
        </div>

        {/* Testimonials Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Testimonial 1 */}
          <div className="bg-neutral-100 p-6 md:p-8 flex flex-col">
            <div className="text-4xl text-neutral-400 leading-none mb-4">"</div>
            <p className="text-base md:text-lg font-light leading-relaxed text-neutral-900 mb-4 flex-grow">
              The leather is sourced from environmentally friendly tanneries in
              Italy, France, and Turkey, where Rure is based and everything is
              assembled by hand.
            </p>
            <div className="pt-4 mt-auto">
              <p className="text-sm text-neutral-900 font-medium">Nordic Magazine</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-neutral-100 p-6 md:p-8 md:pl-[110px] md:pr-[110px] flex flex-col">
            <div className="text-4xl text-neutral-400 leading-none mb-4">"</div>
            <p className="text-base md:text-lg font-light leading-relaxed text-neutral-900 mb-4 flex-grow">
              All too often, we're forced to pick: style, or sustainability.
              Recently, more designers have been making environmental impact a
              top priority.
            </p>
            <div className="pt-4 mt-auto">
              <p className="text-sm text-neutral-900 font-medium">The Minimalist Edit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
