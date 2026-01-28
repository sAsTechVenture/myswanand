'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Menu,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Phone,
  MessageCircle,
  Upload,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/config/theme';
import { useLikedItems } from '@/lib/hooks/useLikedItems';
import { useCartCount } from '@/lib/hooks/useCartCount';
import {
  getContactPhoneNumber,
  getContactPhoneNumberRaw,
} from '@/lib/constants';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getCurrentLocale, createLocalizedPath } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(currentLocale);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { likedItems, refreshLikedItems } = useLikedItems();
  const { cartCount } = useCartCount();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Ensure component is mounted before rendering translations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to get translation
  const t = (key: string): string => {
    if (!isMounted || !dictionary) {
      // Return empty during SSR to avoid hydration mismatch
      return '';
    }
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If path doesn't exist, return empty string
        return '';
      }
    }
    return typeof value === 'string' ? value : '';
  };

  // Update wishlist count when likedItems changes
  useEffect(() => {
    setWishlistCount(likedItems.length);
  }, [likedItems]);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('patient_token');
        const wasLoggedIn = isLoggedIn;
        setIsLoggedIn(!!token);

        // Only refresh liked items if user just logged in (wasn't logged in before)
        if (token && !wasLoggedIn) {
          refreshLikedItems();
        } else if (!token) {
          setWishlistCount(0);
        }
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'patient_token') {
        checkAuth();
      }
    };

    // Listen for custom login/logout events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    // Also check on focus (in case user logged in/out in same tab)
    window.addEventListener('focus', checkAuth);

    // Poll for changes (fallback for same-tab login) - but don't refresh liked items on every poll
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('patient_token');
        setIsLoggedIn(!!token);
        if (!token) {
          setWishlistCount(0);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('focus', checkAuth);
      clearInterval(interval);
    };
  }, [isLoggedIn, refreshLikedItems]);

  const navLinks = [
    { href: createLocalizedPath('/', currentLocale), label: t('common.home') },
    { href: createLocalizedPath('/about', currentLocale), label: t('common.about') },
    { href: createLocalizedPath('/blogs', currentLocale), label: t('common.blogs') },
    { href: createLocalizedPath('/contact', currentLocale), label: t('common.contact') },
  ];

  const serviceLinks = [
    { href: createLocalizedPath('/diagnostic-tests', currentLocale), label: t('common.diagnosticTests') },
    { href: createLocalizedPath('/care-packages', currentLocale), label: t('common.carePackages') },
  ];

  const policyLinks = [
    { href: createLocalizedPath('/refund', currentLocale), label: t('common.refundPolicy') },
    { href: createLocalizedPath('/privacy', currentLocale), label: t('common.privacyPolicy') },
    { href: createLocalizedPath('/terms', currentLocale), label: t('common.termsConditions') },
  ];


  return (
    <header className="w-full" style={{ backgroundColor: colors.primary }}>
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Logo */}
          <Link href={createLocalizedPath('/', currentLocale)} className="flex items-center">
            <div
              className="rounded-full p-2 border-2 flex items-center justify-center"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.yellow,
              }}
            >
              <Image
                src="/logo.png"
                alt="Swanand Pathology Laboratory"
                width={120}
                height={100}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? '' : 'hover:opacity-80'
                  }`}
                  style={{
                    color: isActive ? colors.yellow : colors.white,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80 ${
                    pathname === '/diagnostic-tests' ||
                    pathname === '/care-packages'
                      ? ''
                      : ''
                  }`}
                  style={{
                    color:
                      pathname === '/diagnostic-tests' ||
                      pathname === '/care-packages'
                        ? colors.yellow
                        : colors.white,
                  }}
                  suppressHydrationWarning
                >
                  {t('common.services')}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <nav className="flex flex-col">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: colors.white }}
                  suppressHydrationWarning
                >
                  {t('common.policies')}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <nav className="flex flex-col">
                  {policyLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
          </nav>

          {/* Right Icons / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <>
                <Link href={createLocalizedPath('/profile', currentLocale)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <User className="w-5 h-5" style={{ color: colors.green }} />
                  </Button>
                </Link>
                <Link href="/liked-items">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <Heart
                      className="w-5 h-5"
                      style={{ color: colors.green }}
                    />
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      {wishlistCount}
                    </Badge>
                  </Button>
                </Link>
                <Link href={createLocalizedPath('/cart', currentLocale)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <ShoppingCart
                      className="w-5 h-5"
                      style={{ color: colors.green }}
                    />
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      {cartCount}
                    </Badge>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={createLocalizedPath('/auth/register', currentLocale)}>
                  <Button
                    className="px-4"
                    style={{
                      backgroundColor: colors.white,
                      color: colors.primary,
                    }}
                    suppressHydrationWarning
                  >
                    {t('common.signup')}
                  </Button>
                </Link>
                <Link href={createLocalizedPath('/auth/login', currentLocale)}>
                  <Button
                    className="px-4"
                    style={{
                      backgroundColor: colors.yellow,
                      color: colors.black,
                    }}
                    suppressHydrationWarning
                  >
                    {t('common.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[320px] sm:w-[380px] p-0 overflow-y-auto"
              style={{ backgroundColor: colors.white }}
            >
              <SheetHeader className="p-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-lg p-2 border-2 flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: colors.white,
                      borderColor: colors.yellow,
                    }}
                  >
                    <Image
                      src="/logo.png"
                      alt="Swanand Pathology Laboratory"
                      width={50}
                      height={50}
                      className="object-contain"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col">
                {/* Book lab test section */}
                <div className="p-6 border-b bg-gray-50">
                  <h3 className="text-sm font-semibold mb-3 text-gray-800">
                    Book lab test via
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <Button
                      className="flex-1"
                      style={{
                        backgroundColor: '#dc2626',
                        color: colors.white,
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      className="flex-1"
                      style={{
                        backgroundColor: colors.green,
                        color: colors.white,
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                  <Link
                    href="/upload-prescription"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Prescription
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="p-6 space-y-4">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={`block text-base font-medium py-2 transition-colors ${
                            isActive ? '' : 'text-gray-700 hover:text-primary'
                          }`}
                          style={
                            isActive
                              ? { color: colors.yellow, fontWeight: 600 }
                              : {}
                          }
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}

                  {/* Services Section */}
                  <div className="space-y-2">
                    <div
                      className={`text-base font-medium py-2 ${
                        pathname === '/diagnostic-tests' ||
                        pathname === '/care-packages'
                          ? ''
                          : 'text-gray-700'
                      }`}
                      style={
                        pathname === '/diagnostic-tests' ||
                        pathname === '/care-packages'
                          ? { color: colors.yellow, fontWeight: 600 }
                          : {}
                      }
                    >
                      {t('common.services')}
                    </div>
                    <div className="pl-4 space-y-2">
                      {serviceLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <SheetClose key={link.href} asChild>
                            <Link
                              href={link.href}
                              className={`block text-sm py-1 transition-colors ${
                                isActive
                                  ? ''
                                  : 'text-gray-600 hover:text-primary'
                              }`}
                              style={
                                isActive
                                  ? { color: colors.yellow, fontWeight: 600 }
                                  : {}
                              }
                            >
                              {link.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Language Switcher Section */}
                <div className="p-6 pt-0 space-y-3 border-t">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Language
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {locales.map((locale) => {
                      const isActive = currentLocale === locale;
                      const handleLanguageChange = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isActive) return;
                        
                        let pathWithoutLocale = pathname.replace(/^\/(en|hi|mr)/, '');
                        if (!pathWithoutLocale || pathWithoutLocale === '/') {
                          pathWithoutLocale = '';
                        }
                        const queryString = searchParams.toString();
                        const newPath = `/${locale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`;
                        router.replace(newPath);
                      };
                      
                      return (
                        <SheetClose key={locale} asChild>
                          <button
                            onClick={handleLanguageChange}
                            className={`px-2 py-2.5 text-xs sm:text-sm rounded-md transition-all text-center font-medium ${
                              isActive
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300'
                            }`}
                            style={
                              isActive
                                ? {
                                    backgroundColor: colors.primary,
                                    color: colors.white,
                                  }
                                : {}
                            }
                          >
                            {localeNames[locale]}
                          </button>
                        </SheetClose>
                      );
                    })}
                  </div>
                </div>

                {/* Policies Section */}
                <div className="p-6 pt-0 space-y-3 border-t">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    {t('common.policies')}
                  </h3>
                  {policyLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="block text-sm text-gray-600 hover:text-primary transition-colors py-1"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {/* User Account Section */}
                {isLoggedIn ? (
                  <div className="p-6 pt-0 space-y-3 border-t">
                    <SheetClose asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#f0ede4' }}
                        >
                          <User
                            className="w-5 h-5"
                            style={{ color: colors.green }}
                          />
                        </div>
                        <span>My Profile</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-primary transition-colors py-2 relative"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#f0ede4' }}
                        >
                          <Heart
                            className="w-5 h-5"
                            style={{ color: colors.green }}
                          />
                          <Badge
                            className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            style={{
                              backgroundColor: colors.primary,
                              color: colors.white,
                            }}
                          >
                            {wishlistCount}
                          </Badge>
                        </div>
                        <span>Wishlist</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/cart"
                        className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-primary transition-colors py-2 relative"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#f0ede4' }}
                        >
                          <ShoppingCart
                            className="w-5 h-5"
                            style={{ color: colors.green }}
                          />
                          <Badge
                            className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            style={{
                              backgroundColor: colors.primary,
                              color: colors.white,
                            }}
                          >
                            {cartCount}
                          </Badge>
                        </div>
                        <span>Shopping Cart</span>
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="p-6 pt-0 space-y-3 border-t">
                    <SheetClose asChild>
                      <Link href="/auth/register" className="block w-full">
                        <Button
                          className="w-full"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.white,
                          }}
                          suppressHydrationWarning
                        >
                          {t('common.signup')}
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/auth/login" className="block w-full">
                        <Button
                          className="w-full"
                          variant="outline"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                          }}
                          suppressHydrationWarning
                        >
                          {t('common.signIn')}
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}

                {/* Contact Section */}
                <div
                  className="p-6 mt-auto border-t"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    Need Help?
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={`tel:${getContactPhoneNumberRaw()}`}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.primary }}
                    >
                      <Phone className="w-4 h-4" />
                      {getContactPhoneNumber()}
                    </a>
                    <a
                      href="mailto:hello@myswanand.com"
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.primary }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      hello@myswanand.com
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo - Centered */}
          <div className="flex-1 flex justify-center">
            <Link href={createLocalizedPath('/', currentLocale)} className="flex items-center">
              <div
                className="rounded-lg p-2 border-2 flex items-center justify-center"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.yellow,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Swanand Pathology Laboratory"
                  width={50}
                  height={50}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>
          </div>

          {/* Right Icons / Auth Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <>
                <Link href={createLocalizedPath('/profile', currentLocale)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: colors.green }} />
                  </Button>
                </Link>
                <Link href="/liked-items">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <Heart
                      className="w-4 h-4"
                      style={{ color: colors.green }}
                    />
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      {wishlistCount}
                    </Badge>
                  </Button>
                </Link>
                <Link href={createLocalizedPath('/cart', currentLocale)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    style={{
                      backgroundColor: '#f0ede4',
                    }}
                  >
                    <ShoppingCart
                      className="w-4 h-4"
                      style={{ color: colors.green }}
                    />
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      {cartCount}
                    </Badge>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={createLocalizedPath('/auth/register', currentLocale)}>
                  <Button
                    size="sm"
                    className="px-3 text-xs"
                    style={{
                      backgroundColor: colors.white,
                      color: colors.primary,
                    }}
                  >
                    {t('common.signup')}
                  </Button>
                </Link>
                <Link href={createLocalizedPath('/auth/login', currentLocale)}>
                  <Button
                    size="sm"
                    className="px-3 text-xs"
                    style={{
                      backgroundColor: colors.yellow,
                      color: colors.black,
                    }}
                    suppressHydrationWarning
                  >
                    {t('common.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-300"></div>
    </header>
  );
}
