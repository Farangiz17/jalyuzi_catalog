import { Image } from '@/components/ui/image';
import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/lib/format-address';
import { Routes } from '@/config/routes';
import Link from '@/components/ui/link';
import isEmpty from 'lodash/isEmpty';
import { productPlaceholder } from '@/lib/placeholders';
import { Shop } from '@/types';
import Button from '../button';

type ShopCardProps = {
  shop: Shop;
};

const NearShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const { t } = useTranslation();

  const isNew = false;

  // console.log('Shop', shop)

  return (
    <Link href={Routes.shop(shop.slug)}>
      <div className="group relative cursor-pointer overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),_0_1px_2px_rgba(0,0,0,0.06)] rounded-lg">
        <div className='relative z-10'>
          {isNew && (
            <span className="absolute top-2 rounded bg-blue-500 px-2 py-1 text-xs text-light ltr:right-2 rtl:left-2">
              {t('common:text-new')}
            </span>
          )}
          <div className="relative flex w-full h-[170px] max-w-full shrink-0 items-center justify-center overflow-hidden bg-gray-300">
            <Image
              alt={t('common:text-logo')}
              src={shop?.cover_image?.original ?? productPlaceholder}
              fill
              sizes="(max-width: 768px) 100vw"
              className='transition-transform group-hover:scale-110 transform-gpu'
            />
          </div>
          <div className='bg-overlay absolute inset-0'></div>
          {
            shop?.distance && <div className='py-2 px-2.5 text-white bg-black/50 rounded-md absolute top-2.5 right-2.5 backdrop-blur'>{shop?.distance?.toFixed(2)}km Away</div>
          }
        </div>
        <div className='px-4 pt-3 pb-5 flex items-center gap-3'>
          <div className='flex gap-4 bottom-5 left-5 z-10'>
            <div className="-mt-14 relative z-20 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white border-solid shadow-md">
              <Image
                alt={t('common:text-logo')}
                src={shop?.logo?.thumbnail ?? productPlaceholder}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className='text-lg text-heading font-bold group-hover:text-accent'>{shop?.name}</h4>
              <span className="mt-1.5 text-sm text-body line-clamp-1">
                {/* <MapPin className="h-3.5 w-3.5 shrink-0 text-muted ltr:mr-1 rtl:ml-1" /> */}
                {!isEmpty(formatAddress(shop?.address!))
                  ? formatAddress(shop?.address!)
                  : t('common:text-no-address')}
              </span>
            </div>
          </div>
          {/* {
            shop?.distance && <Button variant='outline' size='small' className='text-heading font-normal group-hover:!bg-accent group-hover:text-white group-hover:border-transparent focus:outline-0 focus:ring-0'>{shop?.distance?.toFixed(2)}km</Button>
          } */}
        </div>
      </div>
    </Link>
  );
};

export default NearShopCard;
