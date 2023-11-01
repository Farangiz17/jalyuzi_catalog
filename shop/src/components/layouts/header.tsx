import Logo from '@/components/ui/logo';
import cn from 'classnames';
import StaticMenu from '@/components/layouts/menu/static-menu';
import { useAtom } from 'jotai';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { authorizationAtom } from '@/store/authorization-atom';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { useMemo, useState } from 'react';
import GroupsDropdownMenu from '@/components/layouts/menu/groups-menu';
import { useHeaderSearch } from '@/layouts/headers/header-search-atom';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { locationAtom } from '@/lib/use-location';
import { MapPin } from '@/components/icons/map-pin';
import Button from '@/components/ui/button';
import LocationBasedShopForm from '@/components/form/location-based-shop-form';
import { useSettings } from '@/framework/settings';
import { ArrowDownIcon } from '@/components/icons/arrow-down';

const Search = dynamic(() => import('@/components/ui/search/search'));
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

const Header = ({ layout }: { layout?: string }) => {
  const { t } = useTranslation('common');
  const { show, hideHeaderSearch } = useHeaderSearch();
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const [openDropdown, setOpenDropdown] = useState(false);
  const isHomePage = useIsHomePage();
  const isMultilangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

  // useEffect(() => {
  //   if (!isHomePage) {
  //     hideHeaderSearch();
  //   }
  // }, [isHomePage]);
  const isFlattenHeader = useMemo(
    () => !show && isHomePage && layout !== 'modern',
    [show, isHomePage, layout]
  );

  const [location] = useAtom(locationAtom);
  const getLocation = location?.street_address ? location?.street_address : location?.formattedAddress
  const closeLocation = () => setOpenDropdown(false)
  const { settings } = useSettings();
  // console.log('settings', location)

  return (
    <header
      className={cn(
        'site-header-with-search top-0 z-50 w-full lg:h-22',
        {
          '': isFlattenHeader,
          'sticky lg:fixed': isHomePage,
          'sticky shadow-sm border-b border-border-200': !isHomePage,
        }
      )}
    >
      <div className={cn('fixed inset-0 bg-black/50 -z-10 w-full h-[100vh]', openDropdown === true ? '' : 'hidden')} onClick={closeLocation}></div>
      <div>
        <div
          className={cn(
            ' flex w-full transform-gpu items-center justify-between bg-light transition-transform duration-300 lg:h-22 lg:px-4 xl:px-8',
            {
              'lg:bg-transparent lg:absolute lg:border-0 lg:shadow-none': isFlattenHeader,
              'lg:!bg-light': openDropdown,
            }
          )}
        >
          <div className="flex flex-col lg:flex-row w-full items-center lg:w-auto grow-0 shrink-0 basis-auto">
            <Logo
              className={cn('pt-2 pb-3', !isMultilangEnable ? 'lg:mx-0' : 'ltr:ml-0 rtl:mr-0')}
            />

            {isMultilangEnable ? (
              <div className="ltr:ml-auto rtl:mr-auto lg:hidden">
                <LanguageSwitcher />
              </div>
            ) : (
              ''
            )}

            <div className="hidden ltr:ml-10 ltr:mr-auto rtl:mr-10 rtl:ml-auto xl:block">
              <GroupsDropdownMenu />
            </div>
            {
              settings?.useGoogleMap && (
                <div className={cn(
                  'lg:ml-8 relative border-t lg:border-none flex justify-center w-full lg:w-auto',
                  isFlattenHeader || isHomePage && 'lg:hidden 2xl:flex',
                  // {
                  //   'lg:hidden xl:flex': !isFlattenHeader,
                  //   'lg:flex': !isHomePage,
                  // }
                )}>
                  <Button
                    variant="custom"
                    className="!flex items-center gap-2 px-0 lg:pl-5 text-sm md:text-base !font-normal max-w-full focus:!shadow-none focus:!ring-0 before:absolute before:left-0 before:w-[1px] before:h-8 lg:before:bg-[#E5E7EB] before:inset-y-0 before:my-auto"
                    onClick={() => setOpenDropdown(!openDropdown)}
                  >
                    <span className="flex grow-0 shrink-0 basis-auto items-center gap-1 text-accent text-base">
                      <MapPin className="w-4 h-4 " />
                      <span>Find Locations :</span>
                    </span>
                    {
                      getLocation ?
                        <span className='pl-1 text-left truncate leading-normal'> {getLocation}</span> :
                        <span className='pl-1 flex items-center gap-2 leading-normal'> Enter your address</span>
                    }
                    <ArrowDownIcon className={cn('mt-1 w-2.5 h-2.5 text-accent transition-all', openDropdown ? 'rotate-180' : '')} />
                  </Button>
                  <LocationBasedShopForm
                    className={cn(
                      "fixed top-[109px] lg:top-[82px] inset-x-0 mx-auto bg-white",
                      openDropdown === true ? "" : "hidden"
                    )}
                    closeLocation={closeLocation}
                  />
                </div>
              )
            }
          </div>

          {isHomePage ? (
            <>
              {(show || layout === 'modern') && (
                <div className="mx-auto hidden w-full overflow-hidden px-10 lg:block xl:w-11/12 2xl:w-10/12">
                  <Search label={t('text-search-label')} variant="minimal" />
                </div>
              )}

              {displayMobileHeaderSearch && (
                <div className="absolute top-0 block h-full w-full bg-light px-5 pt-1.5 ltr:left-0 rtl:right-0 md:pt-2 lg:hidden">
                  <Search label={t('text-search-label')} variant="minimal" />
                </div>
              )}
            </>
          ) : null}
          {/* <button
          className="px-10 ltr:ml-auto rtl:mr-auto"
          onClick={() => openModal('LOCATION_BASED_SHOP')}
        >
          Map
        </button> */}
          <ul className="hidden shrink-0 items-center space-x-7 rtl:space-x-reverse lg:flex 2xl:space-x-10">
            <StaticMenu />
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <a
                href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/register`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded border border-transparent bg-accent px-3 py-0 text-sm font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-accent-hover focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700"
              >
                {t('text-become-seller')}
              </a>
              <li>{isAuthorize ? <AuthorizedMenu /> : <JoinButton />}</li>
            </div>
            {isMultilangEnable ? (
              <div className="ms-auto lg:me-5 xl:me-8 2xl:me-10 hidden flex-shrink-0 lg:block">
                <LanguageSwitcher />
              </div>
            ) : (
              ''
            )}
          </ul>
        </div>
        <div className={cn(
          'w-full bg-light shadow-sm border-b border-t border-border-200',
          isHomePage ? 'hidden lg:block' : 'hidden'
        )}>
          {
            settings?.useGoogleMap && (
              <div className={cn('lg:pl-8 relative border-t lg:border-none flex justify-center w-full lg:w-auto before:absolute before:w-[1px] lg:before:w-0 before:h-8 lg:before:bg-[#E5E7EB] before:inset-y-0 before:my-auto', isFlattenHeader ? 'hidden' : 'lg:flex 2xl:hidden')}>
                <Button
                  variant="custom"
                  className="flex items-center gap-2 focus:!shadow-none focus:!ring-0"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  <span className="flex items-center gap-1 text-accent text-base">
                    <MapPin className="w-4 h-4 " />
                    <span className='hidden md:block'>Find Locations :</span>
                  </span>
                  {
                    getLocation ?
                      <span className='pl-1 flex items-center gap-2'> {getLocation}</span> :
                      <span className='pl-1 flex items-center gap-2'> Enter your address</span>
                  }
                  <ArrowDownIcon className={cn('mt-1 w-2.5 h-2.5 text-accent transition-all', openDropdown ? 'rotate-180' : '')} />
                </Button>
                <LocationBasedShopForm
                  className={cn(
                    "fixed top-14 md:top-[109px] lg:top-[128px] inset-x-0 mx-auto bg-white",
                    openDropdown === true ? "" : "hidden"
                  )}
                  closeLocation={closeLocation}
                />
              </div>
            )
          }
        </div>
      </div>
    </header>
  );
};

export default Header;
