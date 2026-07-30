export default async function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
          Vision Values Holdings Limited
        </h1>
        <p className="text-lg text-gray-200">
          (Hong Kong stock code: 862) is a public company listed in The Stock Exchange of Hong Kong Limited.
        </p>
      </section>

      {/* Company Introduction */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          About the Group
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The Group is principally engaged in the provision of property
          investment, logistics business, minerals exploration and private jet
          management services.
        </p>
      </section>

      {/* Key Metrics Placeholder */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Listed", value: "HKEX: 862" },
          { label: "Sector", value: "Diversified" },
          { label: "Headquarters", value: "Hong Kong" },
          { label: "Business", value: "Multi-industry" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-lg shadow-md p-4 text-center"
          >
            <div className="text-2xl font-bold text-primary mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-500">{metric.label}</div>
          </div>
        ))}
      </section>

      {/* Latest Reports Placeholder */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Latest Reports
        </h2>
        <p className="text-gray-500 text-sm">
          Financial and ESG reports will be displayed here once the CMS is
          connected in Phase 3.
        </p>
      </section>
    </div>
  );
}