import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import Button from '@/components/ui/button';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Radio from '@/components/ui/radio/radio';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { productValidationSchema } from './product-validation-schema';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/graphql/products.graphql';
import ProductVariableForm from './product-variable-form';
import ProductSimpleForm from './product-simple-form';
import ProductGroupInput from './product-group-input';
import ProductCategoryInput from './product-category-input';
import ProductAuthorInput from './product-author-input';
import ProductManufacturerInput from './product-manufacturer-input';
import ProductTypeInput from './product-type-input';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/graphql/shops.graphql';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import ProductTagInput from './product-tag-input';
import Alert from '@/components/ui/alert';
import { useState, useMemo, useCallback } from 'react';
import { Product, ProductStatus, ProductType } from '__generated__/__types__';
import {
  getProductDefaultValues,
  getProductInputValues,
  ProductFormValues,
} from './form-utils';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { EditIcon } from '@/components/icons/edit';
import { split, join, isEmpty } from 'lodash';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { useSettings } from '@/contexts/settings.context';
import Tooltip from '../ui/tooltip';
import { ItemProps } from '@/types/custom-types';
import { useModalAction } from '@/components/ui/modal/modal.context';
import OpenAIButton from '@/components/openAI/openAI.button';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a product description about ${name} in 100 words or less that highlights the key benefits of the product.`,
    },
    {
      id: 2,
      title: `Create a product description about ${name} using HTML tags and include a product ID.`,
    },
    {
      id: 3,
      title: `Write a product description about ${name} using sensory language to appeal to the reader's senses.`,
    },
    {
      id: 4,
      title: `Create a product description about ${name} that includes customer reviews and ratings.`,
    },
    {
      id: 5,
      title: `Write a product description about ${name} using storytelling techniques to create an emotional connection with the reader.`,
    },
    {
      id: 6,
      title: `Write a product description about ${name} that compares and contrasts the product with similar products on the market.`,
    },
    {
      id: 7,
      title: `Create a product description about ${name} that highlights the product's sustainability and eco-friendliness.`,
    },
    {
      id: 8,
      title: `Write a product description about ${name} that includes a list of frequently asked questions and their answers.`,
    },
    {
      id: 9,
      title: `Create a product description about ${name} that includes a video demonstration of the product in use.`,
    },
    {
      id: 10,
      title: `Write a product description about ${name} that includes a call-to-action and encourages the reader to make a purchase.`,
    },
  ];
};

type ProductFormProps = {
  initialValues?: Product | null;
};

export default function CreateOrUpdateProductForm({
  initialValues,
}: ProductFormProps) {
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const router = useRouter();
  const { locale } = router;
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });
  const upload_max_filesize =
    options?.settings?.options?.server_info?.upload_max_filesize ?? 0 / 1024;
  const { isProductReview } = useSettings();
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);
  const { data } = useShopQuery({
    variables: {
      slug: router.query.shop as string,
    },
  });

  let statusList = [
    {
      label: 'form:input-label-under-review',
      id: 'under_review',
      value: ProductStatus.UnderReview,
    },
    {
      label: 'form:input-label-draft',
      id: 'draft',
      value: ProductStatus.Draft,
      className: '',
    },
  ];

  const shopId = data?.shop?.id!;
  const isNewTranslation = router?.query?.action === 'translate';
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.product.list}`
    : Routes.product.list;
  const methods = useForm<ProductFormValues>({
    //@ts-ignore
    resolver: yupResolver(productValidationSchema),
    shouldUnregister: true,
    //@ts-ignore
    defaultValues: getProductDefaultValues(initialValues, isNewTranslation),
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = methods;

  const [createProduct, { loading: creating }] = useCreateProductMutation({
    onCompleted: async () => {
      await router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });

      toast.success(t('common:create-success'));
    },
    onError: (error) => {
      const serverErrors = getErrorMessage(error);
      if (serverErrors?.validation.length) {
        Object.keys(serverErrors?.validation).forEach((field: any) => {
          setError(field.split('.')[1], {
            type: 'manual',
            message: serverErrors?.validation[field][0],
          });
        });
      } else {
        setErrorMessage(error?.message);
      }
    },
  });
  const [updateProduct, { loading: updating }] = useUpdateProductMutation({
    onCompleted: async ({ updateProduct }) => {
      if (updateProduct) {
        if (initialValues?.slug !== updateProduct?.slug) {
          await router.push(
            `${generateRedirectUrl}/${updateProduct?.slug}/edit`,
            undefined,
            {
              locale: Config.defaultLanguage,
            }
          );
        }
      }

      toast.success(t('common:successfully-updated'));
    },
    onError: (error) => {
      const serverErrors = getErrorMessage(error);
      if (serverErrors?.validation.length) {
        Object.keys(serverErrors?.validation).forEach((field: any) => {
          setError(field.split('.')[1], {
            type: 'manual',
            message: serverErrors?.validation[field][0],
          });
        });
      } else {
        setErrorMessage(error?.message);
      }
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    const inputValues = getProductInputValues(values, initialValues);

    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createProduct({
          variables: {
            // @ts-ignore
            input: {
              ...inputValues,
              shop_id: shopId || initialValues?.shop_id,
              // @ts-ignore
              language: router.locale,
              ...(initialValues?.slug && { slug: initialValues.slug }),
            },
          },
        });
      } else {
        await updateProduct({
          variables: {
            // @ts-ignore
            input: {
              ...inputValues,
              id: initialValues.id!,
              shop_id: initialValues.shop_id!,
            },
          },
        });
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  // @ts-ignore
  const selectedProductType = watch('product_type');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'video',
  });
  const slugAutoSuggest = join(split(watch('name'), ' '), '-').toLowerCase();

  if (Boolean(isProductReview)) {
    if (permission) {
      if (initialValues?.status !== ProductStatus?.Draft) {
        statusList = [
          {
            label: 'form:input-label-published',
            id: 'published',
            value: ProductStatus.Publish,
          },
          {
            label: 'form:input-label-approved',
            id: 'approved',
            value: ProductStatus.Approved,
            className: '',
          },
          {
            label: 'form:input-label-rejected',
            id: 'rejected',
            value: ProductStatus.Rejected,
            className: '',
          },
          {
            label: 'form:input-label-soft-disabled',
            id: 'unpublish',
            value: ProductStatus.Unpublish,
            className: '',
          },
        ];
      } else {
        statusList = [
          {
            label: 'form:input-label-draft',
            id: 'draft',
            value: ProductStatus.Draft,
            className: '',
          },
        ];
      }
    } else {
      if (
        initialValues?.status === ProductStatus.Publish ||
        initialValues?.status === ProductStatus.Approved ||
        initialValues?.status === ProductStatus.Unpublish
      ) {
        statusList = [
          {
            label: 'form:input-label-published',
            id: 'published',
            value: ProductStatus.Publish,
          },
          {
            label: 'form:input-label-unpublish',
            id: 'unpublish',
            value: ProductStatus.Unpublish,
          },
        ];
      }
    }
  } else {
    statusList = [
      {
        label: 'form:input-label-published',
        id: 'published',
        value: ProductStatus.Publish,
      },
      {
        label: 'form:input-label-draft',
        id: 'draft',
        value: ProductStatus.Draft,
        className: '',
      },
    ];
  }

  const productName = watch('name');

  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestion({ name: productName ?? '' });
  }, [productName]);
  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: productName,
      set_value: setValue,
      key: 'description',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [productName]);

  const featuredImageInformation = (
    <span>
      {t('form:featured-image-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{upload_max_filesize} MB </span>
    </span>
  );

  const galleryImageInformation = (
    <span>
      {t('form:gallery-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{upload_max_filesize} MB </span>
    </span>
  );

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:featured-image-title')}
              details={featuredImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="image" control={control} multiple={false} />
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:gallery-title')}
              details={galleryImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="gallery" control={control} />
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:video-title')}
              details={t('form:video-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              {/* Video url picker */}
              <div>
                {fields.map((item: any, index: number) => (
                  <div
                    className="py-5 border-b border-dashed border-border-200 first:pt-0 last:border-b-0 md:py-8 md:first:pt-0"
                    key={index}
                  > <div className="flex gap-1 mb-3 text-sm font-semibold leading-none text-body-dark">
                      {`${t('form:input-label-video-embed')} ${index + 1
                        }`}
                      <Tooltip content={t('common:text-video-tooltip')} />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                      <TextArea
                        className="sm:col-span-4"
                        variant="outline"
                        {...register(`video.${index}.url` as const)}
                        defaultValue={item?.url!}
                        // @ts-ignore
                        error={t(errors?.video?.[index]?.url?.message)}
                      />
                      <button
                        onClick={() => {
                          remove(index);
                        }}
                        type="button"
                        className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1"
                      >
                        {t('form:button-label-remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => {
                  append({ url: '' });
                }}
                className="w-full sm:w-auto"
              >
                {t('form:button-label-add-video')}
              </Button>
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">

            <Description
              title={t('form:type-and-category')}
              details={t('form:type-and-category-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <ProductGroupInput
                control={control}
                error={t((errors.type as any)?.message)}
              />
              <ProductCategoryInput control={control} setValue={setValue} />
              <ProductAuthorInput control={control} />
              <ProductManufacturerInput control={control} setValue={setValue} />
              <ProductTagInput control={control} setValue={setValue} />
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:item-description')}
              details={`${
                initialValues
                  ? t('form:item-description-edit')
                  : t('form:item-description-add')
              } ${t('form:product-description-help-text')}`}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t('form:input-label-name')}*`}
                {...register('name')}
                error={t(errors.name?.message!)}
                variant="outline"
                className="mb-5"
              />

              {isSlugEditable ? (
                <div className="relative mb-5">
                  <Input
                    label={`${t('Slug')}`}
                    {...register('slug')}
                    error={t(errors.slug?.message!)}
                    variant="outline"
                    disabled={isSlugDisable}
                  />
                  <button
                    className="absolute top-[27px] right-px z-10 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                    type="button"
                    title={t('common:text-edit')}
                    onClick={() => setIsSlugDisable(false)}
                  >
                    <EditIcon width={14} />
                  </button>
                </div>
              ) : (
                <Input
                  label={`${t('Slug')}`}
                  {...register('slug')}
                  value={slugAutoSuggest}
                  variant="outline"
                  className="mb-5"
                  disabled
                />
              )}

              <Input
                label={`${t('form:input-label-unit')}*`}
                {...register('unit')}
                error={t(errors.unit?.message!)}
                variant="outline"
                className="mb-5"
              />

              <div className="relative">
                {options?.settings?.options?.useAi && (
                  <OpenAIButton
                    title="Generate Description With AI"
                    onClick={handleGenerateDescription}
                  />
                )}
                <TextArea
                  label={t('form:input-label-description')}
                  {...register('description')}
                  error={t(errors.description?.message!)}
                  variant="outline"
                  className="mb-5"
                />
              </div>

              <div>
                <Label>{t('form:input-label-status')}</Label>
                {!isEmpty(statusList)
                  ? statusList?.map((status: any, index: number) => (
                      <Radio
                        {...register('status')}
                        label={t(status?.label)}
                        id={status?.id}
                        value={status?.value}
                        className="mb-2"
                        disabled={
                          permission &&
                          initialValues?.status === ProductStatus?.Draft
                            ? true
                            : false
                        }
                        key={index}
                      />
                    ))
                  : ''}

                {errors.status?.message && (
                  <p className="my-2 text-xs text-red-500">
                    {t(errors?.status?.message!)}
                  </p>
                )}
              </div>
            </Card>
          </div>
          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:form-title-product-type')}
              details={t('form:form-description-product-type')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
            />

            <ProductTypeInput />
          </div>

          {/* Simple Type */}
          {selectedProductType?.value === ProductType.Simple && (
            <ProductSimpleForm initialValues={initialValues} />
          )}

          {/* Variation Type */}
          {selectedProductType?.value === ProductType.Variable && (
            <ProductVariableForm
              initialValues={initialValues}
              settings={options}
            />
          )}

          <div className="mb-4 text-end">
            {initialValues && (
              <Button
                variant="outline"
                onClick={router.back}
                className="me-4"
                type="button"
              >
                {t('form:button-label-back')}
              </Button>
            )}
            <Button loading={updating || creating}>
              {initialValues
                ? t('form:button-label-update-product')
                : t('form:button-label-add-product')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
