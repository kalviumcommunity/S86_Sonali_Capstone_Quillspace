import { PenTool, Users, ShieldCheck, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Write Freely',
      description: 'Distraction-free writing with powerful tools.',
      icon: PenTool,
    },
    {
      id: 2,
      title: 'Build Community',
      description: 'Engage with readers and fellow writers.',
      icon: Users,
    },
    {
      id: 3,
      title: 'Own Your Content',
      description: 'Full control over your content and data.',
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: 'Focus on What Matters',
      description: 'Clean, fast, and built for creators like you.',
      icon: Zap,
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 md:py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-semibold mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
            QuillSpace provides all the tools and features you need to share your voice with the world.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="glass p-6 sm:p-8 rounded-2xl hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group cursor-pointer"
              >
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5 group-hover:scale-110 group-hover:bg-accent group-hover:text-bg transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Line */}
                <div className="mt-4 h-1 w-0 bg-accent rounded-full group-hover:w-8 transition-all duration-300"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
