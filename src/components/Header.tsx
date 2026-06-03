import { useState } from 'react'
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Leaf,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

type Page = string

type Props = {
  currentPage: Page
  onNavigate: (page: Page, params?: Record<string, string>) => void
}

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Shop', page: 'products', hasDropdown: true },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' }
]

export default function Header ({ currentPage, onNavigate }: Props) {
  const { user, profile, signOut } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery })
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className='w-full bg-white border-b border-stone-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='flex items-center justify-between h-20'>
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className='flex items-center gap-2 group'
            >
              <div className='w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors'>
                <Leaf className='w-5 h-5 text-stone-900' />
              </div>
              <div className='flex flex-col leading-none'>
                <span className='text-stone-900 font-bold text-xl tracking-wide font-serif'>
                  Luminary
                </span>
                <span className='text-amber-600 text-[10px] tracking-[0.3em] uppercase font-semibold'>
                  Fine Teas
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className='hidden lg:flex items-center gap-8'>
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => onNavigate(link.page)}
                  className={`text-sm font-semibold tracking-wide transition-colors relative group ${
                    currentPage === link.page
                      ? 'text-amber-600'
                      : 'text-stone-600 hover:text-amber-600'
                  }`}
                >
                  <span className='flex items-center gap-1'>
                    {link.label}
                    {link.hasDropdown && <ChevronDown className='w-3 h-3' />}
                  </span>
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${
                      currentPage === link.page
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}
              {profile?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className='text-sm font-semibold tracking-wide text-emerald-600 hover:text-emerald-500 transition-colors'
                >
                  Admin
                </button>
              )}
            </nav>

            {/* Actions */}
            <div className='flex items-center gap-2'>
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className='p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all'
              >
                <Search className='w-5 h-5' />
              </button>

              {/* Cart */}
              <button
                onClick={() => onNavigate('cart')}
                className='p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all relative'
              >
                <ShoppingCart className='w-5 h-5' />
                {itemCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center'>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* User / Authentication Actions */}
              {user ? (
                <div className='relative hidden sm:block'>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className='flex items-center gap-2 px-3 py-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all'
                  >
                    <div className='w-7 h-7 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center'>
                      <User className='w-4 h-4 text-amber-600' />
                    </div>
                    <span className='text-sm font-medium hidden md:block'>
                      {profile?.name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50'>
                      <button
                        onClick={() => {
                          onNavigate('account')
                          setUserMenuOpen(false)
                        }}
                        className='w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600 transition-colors'
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('orders')
                          setUserMenuOpen(false)
                        }}
                        className='w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600 transition-colors'
                      >
                        My Orders
                      </button>
                      {profile?.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin')
                            setUserMenuOpen(false)
                          }}
                          className='w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-stone-50 transition-colors'
                        >
                          Admin Panel
                        </button>
                      )}
                      <div className='border-t border-stone-100' />
                      <button
                        onClick={() => {
                          signOut()
                          setUserMenuOpen(false)
                        }}
                        className='w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-stone-50 transition-colors'
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('auth')}
                  className='hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold text-sm rounded-full transition-all'
                >
                  <User className='w-4 h-4' />
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className='lg:hidden p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all'
              >
                {menuOpen ? (
                  <X className='w-5 h-5' />
                ) : (
                  <Menu className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar container */}
          {searchOpen && (
            <div className='pb-4 px-2'>
              <form
                onSubmit={handleSearch}
                className='flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-full px-5 py-3'
              >
                <Search className='w-4 h-4 text-stone-400 shrink-0' />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search teas...'
                  className='flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-sm outline-none'
                />
                <button
                  type='submit'
                  className='text-amber-600 text-sm font-medium hover:text-amber-500 transition-colors shrink-0'
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Nav panel */}
        {menuOpen && (
          <div className='lg:hidden bg-white border-t border-stone-200 px-4 py-4 shadow-inner'>
            <div className='flex flex-col gap-1'>
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page)
                    setMenuOpen(false)
                  }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {!user ? (
                <button
                  onClick={() => {
                    onNavigate('auth')
                    setMenuOpen(false)
                  }}
                  className='mt-2 px-4 py-3 bg-amber-500 text-stone-900 font-semibold text-sm rounded-lg text-center'
                >
                  Sign In / Register
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigate('account')
                      setMenuOpen(false)
                    }}
                    className='text-left px-4 py-3 text-sm text-stone-700 hover:text-amber-600 hover:bg-stone-50 rounded-lg'
                  >
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('orders')
                      setMenuOpen(false)
                    }}
                    className='text-left px-4 py-3 text-sm text-stone-700 hover:text-amber-600 hover:bg-stone-50 rounded-lg'
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => {
                      signOut()
                      setMenuOpen(false)
                    }}
                    className='text-left px-4 py-3 text-sm text-red-600 hover:bg-stone-50 rounded-lg'
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay to click away to close menus securely */}
      {userMenuOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  )
}
