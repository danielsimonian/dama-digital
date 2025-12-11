export default function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img 
              src="/images/logo.png" 
              alt="DAMA Digital" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-gray-400">© 2026 Dama Digital. Sua agência criativa.</p>
        </div>
      </div>
    </footer>
  );
}