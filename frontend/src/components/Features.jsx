const features = [
    { title: "Anonymous Forum" },
    { title: "Peer Mentors" },
    { title: "Safe Chat" }
  ];
  
  export default function Features() {
    return (
      <section className="py-16 bg-black text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-blue-500 transition"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>
    );
  }
  