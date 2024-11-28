# Perplex Times

An AI-powered news platform that generates personalized news content using the Perplexity API and modern web technologies.

## Features

- 🤖 AI-generated news articles and headlines
- 📱 Responsive, modern UI with animations
- 🏷️ Dynamic keyword management and filtering
- 💾 Local storage for saved articles and preferences
- 🔄 Real-time content streaming
- 📊 Trending topics discovery
- 🎯 Personalized news sections

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Perplexity API key ([Get one here](https://docs.perplexity.ai/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/perplex-times.git
cd perplex-times
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root and add your API key:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
perplex-times/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── article-tile.tsx  # Article display component
│   └── site-header.tsx   # Navigation header
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/               # Zustand store
└── utils/               # Helper functions
```

## Key Components

### Article Generation
- Uses Perplexity API for content generation
- Streaming responses for better UX
- Automatic keyword extraction
- Source citation and verification

### State Management
- Persistent article storage
- User preferences
- Section management
- Keyword organization

### User Interface
- Expandable article cards
- Interactive keyword management
- Responsive grid layout
- Smooth animations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Perplexity AI](https://www.perplexity.ai/) for the AI API
- [Vercel](https://vercel.com/) for the AI SDK
- [shadcn](https://twitter.com/shadcn) for the UI components
- [v0.dev](https://v0.dev/) for component generation
