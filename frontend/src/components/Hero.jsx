export default function Hero() {
    return (
      <section className="flex flex-col items-center text-center py-24 px-4 bg-gradient-to-b from-black to-gray-900 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          A Safe Space for Teens to Talk
        </h1>
        <div className="space-x-4">
          <button className="bg-white text-black py-2 px-6 rounded-full font-medium hover:bg-gray-200 transition">
            Start Now
          </button>
          <button className="border border-white py-2 px-6 rounded-full font-medium hover:bg-gray-800 transition">
            Learn More
          </button>
        </div>
      </section>
    );
  }
  