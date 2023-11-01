import { Controller} from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { ShopMapLocation } from '@/types';
import Button from '@/components/ui/button';
import { Form } from '@/components/ui/forms/form';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import { Routes } from '@/config/routes';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { ArrowRight } from '@/components/icons/arrow-right';
import { locationAtom } from '@/lib/use-location';

type FormValues = {
  location: ShopMapLocation;
};

interface Props {
  className?: string;
  closeLocation?: () => void;
}

export default function LocationBasedShopForm({ className, closeLocation }: Props) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { closeModal } = useModalAction();
  const [location, setLocation] = useAtom(locationAtom);

  // console.log('location', location)

  const onSubmit = (values: FormValues) => {
    router.push(
      Routes?.nearByShop({
        lat: values?.location?.lat?.toString() as string,
        lng: values?.location?.lng?.toString() as string,
      })
    );

    setLocation(values?.location);
    closeModal();
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("currentLocation");
    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      setLocation(parsedLocation);
    }
  }, []);

  useEffect(() => {
    if (location) {
      const stringifiedLocation = JSON.stringify(location);
      localStorage.setItem("currentLocation", stringifiedLocation);
    }
  }, [location]);

  return (
    <div className={cn('p-5 w-full md:w-[650px] xl:w-[1076px] bg-light md:min-h-0 border border-border-200 shadow-[-8px_8px_16px_rgba(0,0,0,0.18)] md:rounded-xl', className)}>
      {/* <h1 className="mb-4 text-center text-lg font-semibold text-heading sm:mb-6">
        Search Shop Address Location
      </h1> */}
      <Form<FormValues>
        onSubmit={onSubmit}
        className="flex h-full gap-2.5"
      >
        {({ register, control, watch }) => {
          return (
            <>
              <div className="w-full">
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, value } }) => (
                    <GooglePlacesAutocomplete
                      register={register}
                      onChange={onChange}
                      onChangeCurrentLocation={onChange}
                      data={value}
                    />
                  )}
                />
              </div>

              <Button
                className="!px-0 w-12 h-12"
                disabled={!watch('location')}
                onClick={closeLocation}
              >
                <ArrowRight className='w-5 h-5' />
              </Button>
            </>
          );
        }}
      </Form>
    </div>
  );
}