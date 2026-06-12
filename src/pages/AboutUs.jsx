const TEAM = [
  { name: 'Sarah Thompson', role: 'Cinema Manager', emoji: '👩‍💼' },
  { name: 'James Wilson', role: 'Head of Operations', emoji: '👨‍💼' },
  { name: 'Emma Clarke', role: 'Customer Experience', emoji: '👩‍🎨' },
  { name: 'Michael Chen', role: 'Technical Director', emoji: '👨‍💻' },
]

const STATS = [
  { value: '50+', label: 'Partner Cinemas' },
  { value: '500K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Films Booked' },
  { value: '4.9★', label: 'User Rating' },
]

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          About <span className="text-cinema-gold">CineBook</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Bringing the magic of cinema to your fingertips since 2020.
        </p>
      </div>

      {/* Story + stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            CineBook was founded with a simple mission: to make the cinema experience as seamless
            and enjoyable as possible. We believe that a night at the movies should be magical
            from start to finish — and that includes the booking process.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            We partner with the finest cinemas across the country to bring you the widest
            selection of films, from blockbuster hits to independent gems. Our platform makes
            it easy to find what's showing, choose your perfect seats, and secure your tickets
            in minutes.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Whether you're a casual moviegoer or a dedicated cinephile, CineBook is your
            gateway to the big screen.
          </p>
        </div>

        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-8">
          <div className="text-5xl text-center mb-6">🎬</div>
          <div className="grid grid-cols-2 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-cinema-gold text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet the Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="bg-cinema-card border border-cinema-border rounded-xl p-6 text-center hover:border-cinema-gold/30 transition-colors"
            >
              <div className="text-5xl mb-3">{member.emoji}</div>
              <div className="text-white font-semibold text-sm">{member.name}</div>
              <div className="text-gray-400 text-xs mt-1">{member.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-gray-400 mb-6">Have a question or feedback? We'd love to hear from you.</p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <span>📧 hello@cinebook.co.uk</span>
          <span>📞 0800 123 4567</span>
          <span>📍 123 Film Street, London, UK</span>
        </div>
      </div>
    </div>
  )
}
