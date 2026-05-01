const packages = [
  {
    slug: "restaurant",
    name: "Restaurant",
    description:
      "An elegant dining experience website with menus, reservations, and a gallery of signature dishes.",
    sections: {
      hero: {
        headline: "A Culinary Journey Awaits",
        subheadline:
          "Savor handcrafted dishes made from locally sourced ingredients in an atmosphere designed for unforgettable evenings.",
        ctaText: "Reserve a Table",
      },
      services: {
        heading: "What We Offer",
        items: [
          {
            title: "Private Dining",
            description:
              "Host intimate gatherings in our beautifully appointed private dining room, complete with a dedicated chef and personalized menu.",
          },
          {
            title: "Seasonal Menu",
            description:
              "Our menu evolves with the seasons, showcasing the freshest produce and ingredients from local farms and purveyors.",
          },
          {
            title: "Wine Pairing",
            description:
              "Let our sommelier guide you through curated wine pairings that elevate every course into a memorable tasting experience.",
          },
          {
            title: "Catering & Events",
            description:
              "Bring our kitchen to your celebration. From corporate luncheons to wedding receptions, we craft menus tailored to your occasion.",
          },
        ],
      },
      gallery: {
        heading: "From Our Kitchen",
        images: [
          {
            src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
            alt: "Plated fine dining entree with garnish",
          },
          {
            src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
            alt: "Warm restaurant interior with ambient lighting",
          },
          {
            src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
            alt: "Colorful seasonal dish on a rustic table",
          },
          {
            src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
            alt: "Bar area with craft cocktails",
          },
          {
            src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
            alt: "Fresh pasta dish with herbs",
          },
          {
            src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
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
    description:
      "A polished beauty studio site showcasing lash extensions, brow services, and booking options.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "auto-repair",
    name: "Auto Repair Shop",
    description:
      "A trustworthy auto repair website with service listings, appointment scheduling, and customer reviews.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "hair-salon",
    name: "Hair Salon & Barber",
    description:
      "A stylish salon website featuring service menus, stylist profiles, and online booking.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "gym-trainer",
    name: "Gym & Personal Trainer",
    description:
      "A high-energy fitness website with class schedules, trainer bios, and membership sign-up.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "cleaning-service",
    name: "Cleaning Service",
    description:
      "A clean, professional website for residential and commercial cleaning with instant quotes and booking.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "hvac-plumbing",
    name: "HVAC & Plumbing",
    description:
      "A dependable contractor website with emergency service info, service areas, and request forms.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "real-estate-agent",
    name: "Real Estate Agent",
    description:
      "A sleek real estate site with property listings, agent bio, and contact forms for buyers and sellers.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "photographer",
    name: "Photographer",
    description:
      "A visual-first portfolio site for photographers with galleries, pricing packages, and a booking flow.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
  {
    slug: "med-spa",
    name: "Med Spa",
    description:
      "A luxurious med spa website with treatment menus, before-and-after galleries, and appointment booking.",
    sections: {
      hero: {
        headline: "Coming Soon",
        subheadline: "This package is under development.",
        ctaText: "Get Notified",
      },
      services: {
        heading: "Services",
        items: [
          {
            title: "Service details coming soon",
            description: "Check back for a full list of offerings.",
          },
        ],
      },
      gallery: {
        heading: "Gallery",
        images: [
          {
            src: "https://placehold.co/800x600",
            alt: "Placeholder image",
          },
        ],
      },
      testimonials: {
        heading: "Testimonials",
        items: [
          {
            quote: "Testimonial coming soon.",
            author: "Client Name",
            role: "Customer",
          },
        ],
      },
      cta: {
        heading: "Stay Tuned",
        body: "This package is currently being built. Check back soon for the full experience.",
        buttonText: "Learn More",
      },
    },
  },
];

export default packages;
