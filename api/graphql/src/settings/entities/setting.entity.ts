import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

@InputType('SettingInputType', { isAbstract: true })
@ObjectType()
export class Setting extends CoreEntity {
  options?: SettingsOptions;
  language: string;
  translated_languages: string[];
}

@InputType('SmsEventInputType', { isAbstract: true })
@ObjectType()
export class SmsEvent {
  customer?: Customer;
  vendor?: Vendor;
  admin?: Admin;
}
@InputType('EmailEventInputType', { isAbstract: true })
@ObjectType()
export class EmailEvent {
  customer?: Customer;
  vendor?: Vendor;
  admin?: Admin;
}
@InputType('ServerInfoInputType', { isAbstract: true })
@ObjectType()
export class ServerInfo {
  memory_limit?: string;
  post_max_size?: number;
  max_input_time?: string;
  max_execution_time?: string;
  upload_max_filesize?: number;
}

@InputType('CustomerInputType', { isAbstract: true })
@ObjectType()
export class Customer {
  refundOrder?: boolean;
  paymentOrder?: boolean;
  answerQuestion?: boolean;
  statusChangeOrder?: boolean;
}

@InputType('VendorInputType', { isAbstract: true })
@ObjectType()
export class Vendor {
  refundOrder?: boolean;
  createReview?: boolean;
  paymentOrder?: boolean;
  createQuestion?: boolean;
  statusChangeOrder?: boolean;
}

@InputType('AdminInputType', { isAbstract: true })
@ObjectType()
export class Admin {
  refundOrder?: boolean;
  paymentOrder?: boolean;
  statusChangeOrder?: boolean;
}
@InputType('PaymentGatewayInputType', { isAbstract: true })
@ObjectType()
export class PaymentGateway {
  name: string;
  title: string;
}
@InputType('CurrencyOptionsInputType', { isAbstract: true })
@ObjectType()
export class CurrencyOptions {
  formation: string;
  fractions: number;
}
@InputType('DeliveryTimeInputType', { isAbstract: true })
@ObjectType()
export class DeliveryTime {
  title: string;
  description: string;
}

@InputType('SeoSettingsInputType', { isAbstract: true })
@ObjectType()
export class SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: Attachment;
  twitterHandle?: string;
  twitterCardType?: string;
  metaTags?: string;
  canonicalUrl?: string;
}

@InputType('GoogleSettingsInputType', { isAbstract: true })
@ObjectType()
export class GoogleSettings {
  isEnable?: boolean;
  tagManagerId?: string;
}

@InputType('FacebookSettingsInputType', { isAbstract: true })
@ObjectType()
export class FacebookSettings {
  isEnable?: boolean;
  appId?: string;
  pageId?: string;
}

@InputType('ContactDetailsInput', { isAbstract: true })
@ObjectType()
export class ContactDetails {
  socials?: ShopSocials[];
  contact?: string;
  location?: Location;
  website?: string;
}

@InputType('ShopSocialInput', { isAbstract: true })
@ObjectType()
export class ShopSocials {
  icon?: string;
  url?: string;
}

@InputType('LocationInput', { isAbstract: true })
@ObjectType()
export class Location {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
}
@InputType('GoogleMapLocationInput', { isAbstract: true })
@ObjectType()
export class GoogleMapLocation extends Location {
  street_number?: string;
  route?: string;
  street_address?: string;
}

@InputType('SettingsOptionsInputType', { isAbstract: true })
@ObjectType()
export class SettingsOptions {
  siteTitle?: string;
  siteSubtitle?: string;
  currency?: string;
  minimumOrderAmount?: number;
  @Field(() => Int)
  currencyToWalletRatio?: number;
  @Field(() => Int)
  signupPoints?: number;
  deliveryTime?: DeliveryTime[];
  logo?: Attachment;
  useCashOnDelivery?: boolean;
  freeShipping?: boolean;
  freeShippingAmount?: number;
  taxClass?: string;
  shippingClass?: string;
  seo?: SeoSettings;
  google?: GoogleSettings;
  facebook?: FacebookSettings;
  contactDetails?: ContactDetails;
  useOtp?: boolean;
  useGoogleMap?: boolean;
  maximumQuestionLimit?: number;
  // paymentGateway?: string;
  useMustVerifyEmail?: boolean;
  maxShopDistance?: number;
  useEnableGateway?: boolean;
  useAi?: boolean;
  isProductReview?: boolean;
  StripeCardOnly?: boolean;
  guestCheckout?: boolean;
  defaultPaymentGateway?: string;
  currencyOptions?: CurrencyOptions;
  @Field(() => [PaymentGateway])
  paymentGateway?: [PaymentGateway];
  server_info?: ServerInfo;
  @Field(() => SmsEvent, { nullable: true })
  smsEvent?: SmsEvent;
  @Field(() => EmailEvent, { nullable: true })
  emailEvent?: EmailEvent;
}
