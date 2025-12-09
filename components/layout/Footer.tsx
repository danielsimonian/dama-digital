export default function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
              D
            </div>
            <span className="text-xl font-bold">DAMA Digital</span>
          </div>
          <p className="text-gray-400">© 2024 Dama Digital. Sua agência criativa.</p>
        </div>
      </div>
    </footer>
  );
}