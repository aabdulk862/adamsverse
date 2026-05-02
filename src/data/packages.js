const packages = [
  {
    slug: "restaurant",
    name: "Restaurant",
    category: "Food & Hospitality",
    description:
      "An elegant dining experience website with menus, reservations, and a gallery of signature dishes.",
    sections: {
      hero: {
        headline: "A Culinary Journey Awaits",
        subheadline:
          "Savor handcrafted dishes made from locally sourced ingredients in an atmosphere designed for unforgettable evenings.",
        ctaText: "Reserve a Table",
        heroImage:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&fm=webp",
      },
      services: {
        heading: "What We Offer",
        items: [
          {
            title: "Private Dining",
            description:
              "Host intimate gatherings in our beautifully appointed private dining room, complete with a dedicated chef and personalized menu.",
            icon: "🍽️",
          },
          {
            title: "Seasonal Menu",
            description:
              "Our menu evolves with the seasons, showcasing the freshest produce and ingredients from local farms and purveyors.",
            icon: "🌿",
          },
          {
            title: "Wine Pairing",
            description:
              "Let our sommelier guide you through curated wine pairings that elevate every course into a memorable tasting experience.",
            icon: "🍷",
          },
          {
            title: "Catering & Events",
            description:
              "Bring our kitchen to your celebration. From corporate luncheons to wedding receptions, we craft menus tailored to your occasion.",
            icon: "🎉",
          },
        ],
      },
      gallery: {
        heading: "From Our Kitchen",
        images: [
          {
            src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&fm=webp",
            alt: "Plated fine dining entree with garnish",
          },
          {
            src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&fm=webp",
            alt: "Warm restaurant interior with ambient lighting",
          },
          {
            src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fm=webp",
            alt: "Colorful seasonal dish on a rustic table",
          },
          {
            src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&fm=webp",
            alt: "Bar area with craft cocktails",
          },
          {
            src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80&fm=webp",
            alt: "Fresh pasta dish with herbs",
          },
          {
            src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80&fm=webp",
            alt: "Dessert platter with seasonal fruits",
          },
        ],
      },
      testimonials: {
        heading: "What Our Guests Say",
        items: [
          {
            quote:
              "Every visit feels like a special occasion. The seasonal menu never disappoints, and the staff makes you feel like family.",
            author: "Maria Gonzalez",
            role: "Regular Guest",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&fm=webp",
          },
          {
            quote:
              "We hosted our anniversary dinner in the private dining room and it was absolutely perfect. The wine pairing was a highlight.",
            author: "James & Linda Park",
            role: "Private Dining Guests",
          },
          {
            quote:
              "The best farm-to-table experience in the city. You can taste the quality in every bite.",
            author: "David Chen",
            role: "Food Critic",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fm=webp",
          },
        ],
      },
      cta: {
        heading: "Your Table Is Waiting",
        body: "Whether it's a weeknight dinner or a milestone celebration, we'd love to welcome you. Reserve your table today and let us create an evening you'll remember.",
        buttonText: "Make a Reservation",
      },
    },
  },
  {
    slug: "lash-studio",
    name: "Lash & Beauty Studio",
    category: "Beauty & Wellness",
    description:
      "A polished beauty studio site showcasing lash extensions, brow services, and booking options.",
    sections: {
      hero: {
        headline: "Enhance Your Natural Beauty",
        subheadline:
          "Expert lash extensions, brow sculpting, and beauty treatments tailored to bring out your most confident self.",
        ctaText: "Book Your Appointment",
        heroImage:
          "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Our Beauty Services",
        items: [
          {
            title: "Classic Lash Extensions",
            description:
              "Achieve a naturally fuller look with our hand-applied classic lash extensions, customized to your eye shape and desired volume.",
            icon: "✨",
          },
          {
            title: "Volume & Mega Volume Lashes",
            description:
              "For a dramatic, glamorous finish, our volume techniques layer lightweight fans for maximum fullness without weighing down your natural lashes.",
            icon: "💫",
          },
          {
            title: "Brow Sculpting & Tinting",
            description:
              "Define and shape your brows with precision waxing, threading, and custom tinting to frame your face beautifully.",
            icon: "✏️",
          },
          {
            title: "Lash Lift & Tint",
            description:
              "A low-maintenance alternative to extensions, our lash lift curls and tints your natural lashes for weeks of effortless beauty.",
            icon: "🌙",
          },
        ],
      },
      gallery: {
        heading: "Our Work",
        images: [
          {
            src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80&fm=webp",
            alt: "Close-up of beautifully applied lash extensions on a client",
          },
          {
            src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&fm=webp",
            alt: "Modern beauty studio interior with soft lighting and clean stations",
          },
          {
            src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&fm=webp",
            alt: "Lash artist carefully applying individual extensions",
          },
          {
            src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80&fm=webp",
            alt: "Elegant beauty treatment room with fresh flowers and warm decor",
          },
          {
            src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80&fm=webp",
            alt: "Client relaxing during a professional brow sculpting session",
          },
        ],
      },
      testimonials: {
        heading: "What Our Clients Say",
        items: [
          {
            quote:
              "I have never felt more confident. My lashes look incredible and so natural that everyone thinks they are real.",
            author: "Priya Sharma",
            role: "Classic Lash Client",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The studio is immaculate and the attention to detail is unmatched. I will not trust anyone else with my lashes.",
            author: "Jessica Tran",
            role: "Volume Lash Client",
          },
          {
            quote:
              "My brows have never looked this good. The sculpting and tint combo completely transformed my morning routine.",
            author: "Aaliyah Brooks",
            role: "Brow Sculpting Client",
          },
        ],
      },
      cta: {
        heading: "Ready for Your Glow-Up?",
        body: "Whether you want subtle enhancement or full glam, our skilled artists are here to help you look and feel your best. Book your session today.",
        buttonText: "Schedule Now",
      },
    },
  },
  {
    slug: "auto-repair",
    name: "Auto Repair Shop",
    category: "Home Services",
    description:
      "A trustworthy auto repair website with service listings, appointment scheduling, and customer reviews.",
    sections: {
      hero: {
        headline: "Honest Repairs. Reliable Results.",
        subheadline:
          "From routine maintenance to complex diagnostics, our certified technicians keep your vehicle running safely and smoothly.",
        ctaText: "Schedule a Service",
        heroImage:
          "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Our Services",
        items: [
          {
            title: "Brake Repair & Replacement",
            description:
              "Complete brake system inspections, pad and rotor replacements, and fluid flushes to keep you stopping safely in every condition.",
            icon: "🛑",
          },
          {
            title: "Engine Diagnostics",
            description:
              "Advanced computer diagnostics to pinpoint check-engine lights, misfires, and performance issues so repairs are accurate the first time.",
            icon: "🔍",
          },
          {
            title: "Oil Changes & Tune-Ups",
            description:
              "Routine oil changes, filter replacements, and multi-point inspections that extend the life of your engine and prevent costly breakdowns.",
            icon: "🛢️",
          },
          {
            title: "Tire Sales & Alignment",
            description:
              "New tire installation, balancing, rotation, and precision alignment services to maximize tire life and improve handling.",
            icon: "🔧",
          },
        ],
      },
      gallery: {
        heading: "Inside Our Shop",
        images: [
          {
            src: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80&fm=webp",
            alt: "Mechanic inspecting the underside of a vehicle on a hydraulic lift",
          },
          {
            src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80&fm=webp",
            alt: "Organized auto repair shop with tools and diagnostic equipment",
          },
          {
            src: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80&fm=webp",
            alt: "Technician performing an engine diagnostic with a scan tool",
          },
          {
            src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&fm=webp",
            alt: "Close-up of a brake rotor and caliper during replacement",
          },
          {
            src: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da20?w=800&q=80&fm=webp",
            alt: "Row of tires on display in the shop waiting area",
          },
        ],
      },
      testimonials: {
        heading: "What Our Customers Say",
        items: [
          {
            quote:
              "They diagnosed a problem two other shops missed and fixed it at a fair price. I will not take my car anywhere else.",
            author: "Kevin Marshall",
            role: "Loyal Customer",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&fm=webp",
          },
          {
            quote:
              "Honest, fast, and affordable. They showed me exactly what needed to be done and never pushed unnecessary work.",
            author: "Sandra Nguyen",
            role: "First-Time Customer",
          },
          {
            quote:
              "I brought in my truck for a brake job and they had it done the same day. Great communication the whole time.",
            author: "Tony Ramirez",
            role: "Fleet Manager",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&fm=webp",
          },
        ],
      },
      cta: {
        heading: "Keep Your Vehicle in Top Shape",
        body: "Do not wait for a warning light to take action. Schedule your next service appointment and drive with confidence knowing your car is in expert hands.",
        buttonText: "Book an Appointment",
      },
    },
  },
  {
    slug: "hair-salon",
    name: "Hair Salon & Barber",
    category: "Beauty & Wellness",
    description:
      "A stylish salon website featuring service menus, stylist profiles, and online booking.",
    sections: {
      hero: {
        headline: "Where Style Meets Craft",
        subheadline:
          "From precision cuts to bold color transformations, our stylists bring your vision to life in a welcoming, creative space.",
        ctaText: "Book a Stylist",
        heroImage:
          "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&fm=webp",
      },
      services: {
        heading: "What We Do Best",
        items: [
          {
            title: "Haircuts & Styling",
            description:
              "Precision cuts for all hair types, from classic fades and tapers to modern textured styles and blowouts tailored to your look.",
            icon: "✂️",
          },
          {
            title: "Color & Highlights",
            description:
              "Full color, balayage, ombre, and highlights using premium products that protect your hair while delivering vibrant, lasting results.",
            icon: "🎨",
          },
          {
            title: "Treatments & Conditioning",
            description:
              "Deep conditioning, keratin smoothing, and scalp treatments that restore health, shine, and manageability to damaged or dry hair.",
            icon: "💆",
          },
          {
            title: "Beard Grooming & Hot Shaves",
            description:
              "Classic straight-razor shaves, beard shaping, and grooming services for a polished, refined finish.",
            icon: "🪒",
          },
        ],
      },
      gallery: {
        heading: "From the Chair",
        images: [
          {
            src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&fm=webp",
            alt: "Stylist giving a precision haircut in a modern salon",
          },
          {
            src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&fm=webp",
            alt: "Barber performing a classic fade with professional clippers",
          },
          {
            src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&fm=webp",
            alt: "Bright salon interior with styling stations and large mirrors",
          },
          {
            src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80&fm=webp",
            alt: "Client admiring a fresh balayage color treatment",
          },
          {
            src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80&fm=webp",
            alt: "Barber applying hot lather for a traditional straight-razor shave",
          },
        ],
      },
      testimonials: {
        heading: "Happy Clients",
        items: [
          {
            quote:
              "Best haircut I have ever had. My stylist actually listened to what I wanted and nailed it on the first visit.",
            author: "Marcus Johnson",
            role: "Haircut Client",
            avatar:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The balayage turned out even better than the reference photo I brought in. I get compliments everywhere I go.",
            author: "Sofia Reyes",
            role: "Color Client",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fm=webp",
          },
          {
            quote:
              "I have been coming here for my beard trims for over a year. The hot shave experience is worth every penny.",
            author: "Daniel Kim",
            role: "Grooming Client",
          },
        ],
      },
      cta: {
        heading: "Your Best Look Starts Here",
        body: "Walk-ins are welcome, but appointments guarantee your preferred stylist and time. Reserve your chair and leave looking your absolute best.",
        buttonText: "Reserve Your Chair",
      },
    },
  },
  {
    slug: "gym-trainer",
    name: "Gym & Personal Trainer",
    category: "Beauty & Wellness",
    description:
      "A high-energy fitness website with class schedules, trainer bios, and membership sign-up.",
    sections: {
      hero: {
        headline: "Train Hard. Live Strong.",
        subheadline:
          "Personalized training programs, group fitness classes, and a supportive community to help you crush your goals.",
        ctaText: "Start Your Free Trial",
        heroImage:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Programs & Services",
        items: [
          {
            title: "One-on-One Personal Training",
            description:
              "Work directly with a certified trainer who builds a custom program around your goals, fitness level, and schedule.",
            icon: "💪",
          },
          {
            title: "Group Fitness Classes",
            description:
              "High-energy HIIT, yoga, spin, and strength classes led by experienced instructors in a motivating group setting.",
            icon: "🏋️",
          },
          {
            title: "Nutrition Coaching",
            description:
              "Fuel your progress with personalized meal plans and ongoing nutrition guidance designed to complement your training.",
            icon: "🥗",
          },
          {
            title: "Body Composition Analysis",
            description:
              "Track your progress with detailed body composition scans that measure muscle mass, body fat, and metabolic rate.",
            icon: "📊",
          },
        ],
      },
      gallery: {
        heading: "Inside the Gym",
        images: [
          {
            src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&fm=webp",
            alt: "Modern gym floor with free weights and strength training equipment",
          },
          {
            src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80&fm=webp",
            alt: "Personal trainer guiding a client through a kettlebell workout",
          },
          {
            src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80&fm=webp",
            alt: "Energetic group fitness class doing high-intensity interval training",
          },
          {
            src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80&fm=webp",
            alt: "Athlete stretching in a bright open studio space",
          },
          {
            src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&fm=webp",
            alt: "Focused lifter performing a barbell squat with proper form",
          },
        ],
      },
      testimonials: {
        heading: "Member Results",
        items: [
          {
            quote:
              "I lost 30 pounds in four months with my trainer's guidance. The personalized approach made all the difference.",
            author: "Chris Morales",
            role: "Personal Training Member",
            avatar:
              "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The group classes keep me accountable and motivated. I actually look forward to working out now.",
            author: "Tamika Williams",
            role: "Group Fitness Member",
          },
          {
            quote:
              "The nutrition coaching was a game-changer. I finally understand how to eat for my goals instead of guessing.",
            author: "Ryan O'Brien",
            role: "Nutrition Coaching Client",
            avatar:
              "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&q=80&fm=webp",
          },
        ],
      },
      cta: {
        heading: "Your Transformation Starts Today",
        body: "No matter where you are in your fitness journey, we have the programs, coaches, and community to help you get where you want to be. Try us free for a week.",
        buttonText: "Claim Your Free Week",
      },
    },
  },
  {
    slug: "cleaning-service",
    name: "Cleaning Service",
    category: "Home Services",
    description:
      "A clean, professional website for residential and commercial cleaning with instant quotes and booking.",
    sections: {
      hero: {
        headline: "A Spotless Space, Every Time",
        subheadline:
          "Reliable residential and commercial cleaning services that leave your home or office fresh, sanitized, and perfectly maintained.",
        ctaText: "Get a Free Quote",
        heroImage:
          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Cleaning Solutions",
        items: [
          {
            title: "Residential Deep Cleaning",
            description:
              "Thorough top-to-bottom cleaning of your home including kitchens, bathrooms, floors, and hard-to-reach areas for a truly fresh start.",
            icon: "🏠",
          },
          {
            title: "Recurring Housekeeping",
            description:
              "Weekly, bi-weekly, or monthly cleaning plans customized to your schedule so your home stays consistently clean without the hassle.",
            icon: "🔄",
          },
          {
            title: "Commercial & Office Cleaning",
            description:
              "Professional cleaning for offices, retail spaces, and common areas that keeps your workplace healthy, presentable, and productive.",
            icon: "🏢",
          },
          {
            title: "Move-In & Move-Out Cleaning",
            description:
              "Comprehensive cleaning for tenants and homeowners transitioning between spaces, ensuring every surface is spotless for the next chapter.",
            icon: "📦",
          },
        ],
      },
      gallery: {
        heading: "Our Results",
        images: [
          {
            src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&fm=webp",
            alt: "Professional cleaner wiping down a modern kitchen countertop",
          },
          {
            src: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80&fm=webp",
            alt: "Bright and spotless living room after a deep cleaning session",
          },
          {
            src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80&fm=webp",
            alt: "Sparkling clean bathroom with white tile and polished fixtures",
          },
          {
            src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&fm=webp",
            alt: "Organized cleaning supplies and eco-friendly products ready for use",
          },
          {
            src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fm=webp",
            alt: "Clean and organized office workspace with polished desks",
          },
        ],
      },
      testimonials: {
        heading: "Happy Clients",
        items: [
          {
            quote:
              "They transformed our home before a family gathering. Every room was immaculate and smelled amazing. We have booked them monthly ever since.",
            author: "Rachel Kim",
            role: "Residential Client",
          },
          {
            quote:
              "Our office has never looked better. The team is punctual, thorough, and always professional. Highly recommend for any business.",
            author: "Mark Sullivan",
            role: "Office Manager",
            avatar:
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The move-out cleaning saved our security deposit. They got stains out of the carpet we thought were permanent.",
            author: "Jasmine Carter",
            role: "Move-Out Client",
          },
        ],
      },
      cta: {
        heading: "Ready for a Cleaner Space?",
        body: "Whether it is a one-time deep clean or a recurring plan, our team delivers consistent, high-quality results you can count on. Get your free estimate today.",
        buttonText: "Request a Quote",
      },
    },
  },
  {
    slug: "landscaping",
    name: "Landscaping & Lawn Care",
    category: "Home Services",
    description:
      "A fresh, outdoor-focused website for lawn care and landscaping businesses with service areas, seasonal offerings, and free estimate requests.",
    sections: {
      hero: {
        headline: "Your Yard, Transformed",
        subheadline:
          "Professional landscaping, lawn maintenance, and outdoor design services that turn your property into the best-looking lot on the block.",
        ctaText: "Get a Free Estimate",
        heroImage:
          "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80&fm=webp",
      },
      services: {
        heading: "What We Do",
        items: [
          {
            title: "Lawn Mowing & Maintenance",
            description:
              "Scheduled mowing, edging, and trimming services that keep your lawn healthy, even, and looking its best throughout the growing season.",
            icon: "🌱",
          },
          {
            title: "Landscape Design & Installation",
            description:
              "Custom garden beds, walkways, retaining walls, and plantings designed to enhance your property's curb appeal and outdoor living space.",
            icon: "🏡",
          },
          {
            title: "Tree & Shrub Care",
            description:
              "Pruning, shaping, fertilization, and disease treatment for trees and shrubs to promote healthy growth and a polished appearance.",
            icon: "🌳",
          },
          {
            title: "Seasonal Cleanup & Mulching",
            description:
              "Spring and fall cleanups, leaf removal, and fresh mulch application to protect your beds and keep your landscape looking sharp year-round.",
            icon: "🍂",
          },
        ],
      },
      gallery: {
        heading: "Our Work",
        images: [
          {
            src: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80&fm=webp",
            alt: "Beautifully manicured front yard with lush green lawn and flower beds",
          },
          {
            src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&fm=webp",
            alt: "Stone walkway winding through a professionally landscaped garden",
          },
          {
            src: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80&fm=webp",
            alt: "Landscaper operating a commercial mower on a large residential lawn",
          },
          {
            src: "https://images.unsplash.com/photo-1598902108854-d1446677672c?w=800&q=80&fm=webp",
            alt: "Freshly mulched garden bed with trimmed shrubs and colorful perennials",
          },
          {
            src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fm=webp",
            alt: "Backyard patio area surrounded by professional landscaping and outdoor lighting",
          },
        ],
      },
      testimonials: {
        heading: "What Homeowners Say",
        items: [
          {
            quote:
              "Our yard went from embarrassing to the envy of the neighborhood. The design team listened to exactly what we wanted and delivered beyond expectations.",
            author: "Laura Bennett",
            role: "Landscape Design Client",
            avatar:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&fm=webp",
          },
          {
            quote:
              "Reliable, on time, and our lawn has never looked better. We have used their weekly service for two seasons and would not switch.",
            author: "Greg Hoffman",
            role: "Lawn Maintenance Client",
          },
          {
            quote:
              "They saved two mature oaks in our backyard that another company wanted to remove. Knowledgeable and genuinely care about the work.",
            author: "Diane Patel",
            role: "Tree Care Client",
          },
        ],
      },
      cta: {
        heading: "Let Us Bring Your Outdoor Vision to Life",
        body: "From weekly lawn care to full landscape transformations, our crew has the skills and equipment to handle projects of any size. Request your free estimate today.",
        buttonText: "Request an Estimate",
      },
    },
  },
  {
    slug: "real-estate-agent",
    name: "Real Estate Agent",
    category: "Professional",
    description:
      "A sleek real estate site with property listings, agent bio, and contact forms for buyers and sellers.",
    sections: {
      hero: {
        headline: "Find Your Perfect Home",
        subheadline:
          "Whether you are buying your first home or selling a cherished property, get expert guidance and local market knowledge every step of the way.",
        ctaText: "Schedule a Consultation",
        heroImage:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp",
      },
      services: {
        heading: "How I Help",
        items: [
          {
            title: "Buyer Representation",
            description:
              "From neighborhood research to closing day, I guide buyers through every step, negotiating the best price and terms on your behalf.",
            icon: "🏠",
          },
          {
            title: "Home Selling Strategy",
            description:
              "Professional staging advice, strategic pricing, and targeted marketing to sell your property quickly and for top dollar.",
            icon: "📈",
          },
          {
            title: "Market Analysis & Pricing",
            description:
              "Detailed comparative market analyses that give you a clear picture of your home's value and the current competitive landscape.",
            icon: "📊",
          },
          {
            title: "Relocation Assistance",
            description:
              "Moving to a new city? I coordinate everything from neighborhood tours to school district research so your transition is seamless.",
            icon: "🚚",
          },
        ],
      },
      gallery: {
        heading: "Featured Properties",
        images: [
          {
            src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp",
            alt: "Modern two-story home with manicured lawn and warm exterior lighting",
          },
          {
            src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp",
            alt: "Spacious open-concept living room with hardwood floors and natural light",
          },
          {
            src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&fm=webp",
            alt: "Bright modern kitchen with granite countertops and stainless steel appliances",
          },
          {
            src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fm=webp",
            alt: "Luxury backyard patio with pool and outdoor seating area",
          },
          {
            src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80&fm=webp",
            alt: "Charming suburban neighborhood street lined with mature trees",
          },
        ],
      },
      testimonials: {
        heading: "Client Success Stories",
        items: [
          {
            quote:
              "She found us our dream home in a competitive market and negotiated a price we never thought possible. We could not have done it without her.",
            author: "Michael & Sarah Torres",
            role: "First-Time Buyers",
          },
          {
            quote:
              "Our house sold in five days above asking price. The marketing strategy and staging advice made all the difference.",
            author: "Robert Langston",
            role: "Home Seller",
            avatar:
              "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fm=webp",
          },
          {
            quote:
              "Relocating from out of state was stressful, but she made the entire process feel effortless. We found the perfect neighborhood for our family.",
            author: "Anita Desai",
            role: "Relocation Client",
          },
        ],
      },
      cta: {
        heading: "Ready to Make Your Move?",
        body: "Whether you are searching for your next home or preparing to list, a quick conversation is the best first step. Let us discuss your goals and build a plan together.",
        buttonText: "Book a Free Consultation",
      },
    },
  },
  {
    slug: "photographer",
    name: "Photographer",
    category: "Professional",
    description:
      "A visual-first portfolio site for photographers with galleries, pricing packages, and a booking flow.",
    sections: {
      hero: {
        headline: "Moments Worth Remembering",
        subheadline:
          "Authentic, timeless photography for weddings, portraits, and brands. Every session is crafted to tell your unique story.",
        ctaText: "View Portfolio",
        heroImage:
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80&fm=webp",
      },
      services: {
        heading: "What I Offer",
        items: [
          {
            title: "Wedding & Elopement Photography",
            description:
              "Full-day and half-day coverage capturing every meaningful moment, from getting ready to the last dance, with a cinematic editorial style.",
            icon: "💒",
          },
          {
            title: "Portrait Sessions",
            description:
              "Individual, couple, and family portraits in studio or on location, with professional retouching and a curated online gallery.",
            icon: "📸",
          },
          {
            title: "Brand & Commercial Photography",
            description:
              "Product shots, headshots, and lifestyle imagery tailored to elevate your brand's visual identity across web and print.",
            icon: "🖼️",
          },
          {
            title: "Event Coverage",
            description:
              "Corporate events, galas, and milestone celebrations documented with a photojournalistic approach that captures the energy of the day.",
            icon: "🎪",
          },
        ],
      },
      gallery: {
        heading: "Recent Work",
        images: [
          {
            src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&fm=webp",
            alt: "Bride and groom sharing a first look in golden hour light",
          },
          {
            src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80&fm=webp",
            alt: "Professional portrait of a woman in natural window light",
          },
          {
            src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80&fm=webp",
            alt: "Photographer composing a shot with a DSLR camera on location",
          },
          {
            src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80&fm=webp",
            alt: "Flat lay of styled product photography with props and soft lighting",
          },
          {
            src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80&fm=webp",
            alt: "Candid moment of guests laughing during a wedding reception",
          },
        ],
      },
      testimonials: {
        heading: "Kind Words from Clients",
        items: [
          {
            quote:
              "The photos from our wedding still take my breath away. She captured moments we did not even know were happening and every image tells a story.",
            author: "Emily & Jason Carter",
            role: "Wedding Clients",
            avatar:
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80&fm=webp",
          },
          {
            quote:
              "Our brand photography elevated our entire online presence. The images are polished, on-brand, and we use them everywhere.",
            author: "Natalie Simmons",
            role: "Small Business Owner",
          },
          {
            quote:
              "I have never felt so comfortable in front of a camera. The portrait session was relaxed and fun, and the results exceeded my expectations.",
            author: "David Okafor",
            role: "Portrait Client",
          },
        ],
      },
      cta: {
        heading: "Let Us Create Something Beautiful",
        body: "Every great image starts with a conversation. Tell me about your vision and let us plan a session that captures exactly what matters to you.",
        buttonText: "Book Your Session",
      },
    },
  },
  {
    slug: "attorney",
    name: "Attorney & Law Firm",
    category: "Professional",
    description:
      "A professional law firm website with practice areas, attorney profiles, case results, and consultation booking.",
    sections: {
      hero: {
        headline: "Experienced Counsel You Can Trust",
        subheadline:
          "Dedicated legal representation for individuals and businesses. We fight for your rights with integrity, precision, and a proven track record.",
        ctaText: "Request a Consultation",
        heroImage:
          "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Practice Areas",
        items: [
          {
            title: "Personal Injury",
            description:
              "Aggressive representation for accident victims, from car collisions to workplace injuries, ensuring you receive the compensation you deserve.",
            icon: "⚖️",
          },
          {
            title: "Family Law",
            description:
              "Compassionate guidance through divorce, custody disputes, and adoption proceedings, always prioritizing the well-being of your family.",
            icon: "👨‍👩‍👧",
          },
          {
            title: "Business & Corporate Law",
            description:
              "Contract drafting, entity formation, mergers, and compliance counsel that protect your business interests and support growth.",
            icon: "📋",
          },
          {
            title: "Estate Planning",
            description:
              "Wills, trusts, and probate administration crafted to preserve your legacy and provide peace of mind for you and your loved ones.",
            icon: "🏛️",
          },
        ],
      },
      gallery: {
        heading: "Our Firm",
        images: [
          {
            src: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fm=webp",
            alt: "Professional law office with bookshelves of legal volumes and a polished desk",
          },
          {
            src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fm=webp",
            alt: "Attorney in a tailored suit reviewing case documents",
          },
          {
            src: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80&fm=webp",
            alt: "Modern conference room prepared for a client meeting",
          },
          {
            src: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80&fm=webp",
            alt: "Close-up of a gavel and legal scales on a wooden surface",
          },
          {
            src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fm=webp",
            alt: "Client and attorney shaking hands after a successful consultation",
          },
        ],
      },
      testimonials: {
        heading: "What Our Clients Say",
        items: [
          {
            quote:
              "After my accident, they handled everything so I could focus on recovery. The settlement exceeded what I thought was possible.",
            author: "Marcus Rivera",
            role: "Personal Injury Client",
            avatar:
              "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&q=80&fm=webp",
          },
          {
            quote:
              "Going through a custody battle was the hardest thing I have ever faced. Their team was compassionate, strategic, and always available when I needed them.",
            author: "Jennifer Walsh",
            role: "Family Law Client",
          },
          {
            quote:
              "They structured our business partnership agreement and saved us from a potential dispute down the road. Worth every penny.",
            author: "Thomas & Karen Liu",
            role: "Business Law Clients",
            avatar:
              "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&fm=webp",
          },
        ],
      },
      cta: {
        heading: "Protect What Matters Most",
        body: "Legal challenges do not wait, and neither should you. Schedule a confidential consultation to discuss your case and learn how we can help you move forward.",
        buttonText: "Schedule a Consultation",
      },
    },
  },
  {
    slug: "cafe-coffee-shop",
    name: "Café & Coffee Shop",
    category: "Food & Hospitality",
    description:
      "A warm, inviting website for cafés and coffee shops with menus, location info, and online ordering.",
    sections: {
      hero: {
        headline: "Brewed with Passion, Served with Care",
        subheadline:
          "Specialty coffee, fresh pastries, and a cozy atmosphere where every cup is crafted to brighten your day.",
        ctaText: "View Our Menu",
        heroImage:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fm=webp",
      },
      services: {
        heading: "What We Serve",
        items: [
          {
            title: "Specialty Espresso Drinks",
            description:
              "Hand-pulled espresso, silky lattes, and creative seasonal drinks made with single-origin beans roasted in small batches for peak flavor.",
            icon: "☕",
          },
          {
            title: "Pour-Over & Cold Brew",
            description:
              "Slow-brewed pour-overs highlighting unique tasting notes and smooth, refreshing cold brew steeped for 18 hours and served on tap.",
            icon: "🫗",
          },
          {
            title: "Fresh Pastries & Light Bites",
            description:
              "House-baked croissants, muffins, and savory breakfast sandwiches prepared daily using locally sourced, seasonal ingredients.",
            icon: "🥐",
          },
          {
            title: "Catering & Coffee Bar Service",
            description:
              "Bring the café experience to your event with our mobile coffee bar, complete with a barista, custom drink menu, and fresh pastry spread.",
            icon: "🎉",
          },
        ],
      },
      gallery: {
        heading: "Life at the Café",
        images: [
          {
            src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&fm=webp",
            alt: "Latte art in a ceramic cup on a wooden café table",
          },
          {
            src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&fm=webp",
            alt: "Cozy café interior with warm lighting and exposed brick walls",
          },
          {
            src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fm=webp",
            alt: "Barista pouring steamed milk into an espresso for a cappuccino",
          },
          {
            src: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80&fm=webp",
            alt: "Display case filled with freshly baked pastries and croissants",
          },
          {
            src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80&fm=webp",
            alt: "Customers enjoying coffee and conversation at a sunlit window seat",
          },
        ],
      },
      testimonials: {
        heading: "What Our Regulars Say",
        items: [
          {
            quote:
              "This is my morning ritual. The espresso is consistently perfect and the staff remembers my order before I even reach the counter.",
            author: "Nina Alvarez",
            role: "Daily Regular",
            avatar:
              "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The pour-over selection introduced me to coffee I never knew I was missing. It is the only place I trust for a truly great cup.",
            author: "Ethan Nakamura",
            role: "Coffee Enthusiast",
          },
          {
            quote:
              "We hired their coffee bar for our company retreat and it was the highlight of the event. Professional, friendly, and the drinks were outstanding.",
            author: "Carla Mendes",
            role: "Event Organizer",
          },
        ],
      },
      cta: {
        heading: "Your Favorite Cup Is Waiting",
        body: "Whether you need a quick morning pick-me-up or a quiet corner to work from, our doors are open and the coffee is always fresh. Stop by or order ahead.",
        buttonText: "Order Ahead",
      },
    },
  },
  {
    slug: "hotel-bnb",
    name: "Hotel & B&B",
    category: "Food & Hospitality",
    description:
      "A polished hospitality website for hotels and bed-and-breakfasts with room galleries, amenities, and reservation booking.",
    sections: {
      hero: {
        headline: "Rest, Recharge, and Rediscover",
        subheadline:
          "Thoughtfully appointed rooms, warm hospitality, and a location that puts you at the heart of it all. Your perfect stay starts here.",
        ctaText: "Check Availability",
        heroImage:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp",
      },
      services: {
        heading: "Guest Amenities & Services",
        items: [
          {
            title: "Boutique Rooms & Suites",
            description:
              "Individually designed rooms featuring premium linens, curated decor, and modern comforts that blend character with relaxation.",
            icon: "🛏️",
          },
          {
            title: "Farm-to-Table Breakfast",
            description:
              "Wake up to a complimentary gourmet breakfast prepared with locally sourced ingredients, served in our sunlit dining room each morning.",
            icon: "🍳",
          },
          {
            title: "Concierge & Local Experiences",
            description:
              "Our concierge team arranges restaurant reservations, guided tours, and curated local experiences so you get the most out of your visit.",
            icon: "🗺️",
          },
          {
            title: "Event & Meeting Spaces",
            description:
              "Elegant private rooms for intimate weddings, corporate retreats, and special gatherings, with full catering and AV support available.",
            icon: "🏛️",
          },
        ],
      },
      gallery: {
        heading: "A Glimpse of Your Stay",
        images: [
          {
            src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp",
            alt: "Elegant hotel room with a king bed, soft lighting, and modern decor",
          },
          {
            src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp",
            alt: "Inviting hotel lobby with comfortable seating and warm ambient lighting",
          },
          {
            src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&fm=webp",
            alt: "Bright breakfast spread with fresh fruit, pastries, and coffee on a dining table",
          },
          {
            src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&fm=webp",
            alt: "Charming bed-and-breakfast exterior with a garden patio and string lights",
          },
          {
            src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80&fm=webp",
            alt: "Luxurious bathroom with a freestanding tub and natural stone finishes",
          },
        ],
      },
      testimonials: {
        heading: "Guest Experiences",
        items: [
          {
            quote:
              "From the moment we checked in, we felt at home. The room was beautiful, the breakfast was incredible, and the staff went above and beyond.",
            author: "Claire & Thomas Whitfield",
            role: "Anniversary Guests",
            avatar:
              "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=800&q=80&fm=webp",
          },
          {
            quote:
              "The concierge recommended a hidden gem restaurant and booked us a sunset sailing tour. It made our trip truly unforgettable.",
            author: "Raj Patel",
            role: "Leisure Traveler",
          },
          {
            quote:
              "We hosted a small corporate retreat here and the event space was perfect. Excellent catering, seamless AV setup, and a team that anticipated every need.",
            author: "Monica Reeves",
            role: "Corporate Event Planner",
            avatar:
              "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fm=webp",
          },
        ],
      },
      cta: {
        heading: "Book Your Perfect Getaway",
        body: "Whether it is a romantic weekend, a family vacation, or a productive retreat, we have the rooms, the service, and the setting to make it memorable. Reserve your stay today.",
        buttonText: "Reserve a Room",
      },
    },
  },
];

export default packages;
