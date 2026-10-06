import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    batchVariantImagesWorkflow,
    updateProductsWorkflow,
    updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

const OLD_CDN_HOST = "cdn.mignite.app";

const PRODUCT_IMAGES: Record<
    string,
    {
        thumbnail: string;
        images: string[];
        variantImages?: Record<string, string[]>;
    }
> = {
    "crewneck-sweatshirt": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--1-01M48EJ28WN3FKQXBBPP1MD9TF.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--1-01M48EJ28WN3FKQXBBPP1MD9TF.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--2-01M48EJ2FEYS5VCQ72ZNMCW274.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--3-01M48EJ31RP0QMZDXJ4WJS9AAJ.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--1-01M48EJ28HP945G5KSHS6BSD3C.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--2-01M48EJ2T41JW2JPCZ1XGHBATQ.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--3-01M48EJ38EGMJ9VYXAEZ9GP13T.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--1-01M48EJ32J9SXRKQWBDHAPZZB8.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--2-01M48EJ373GNR93K1QCQ3GVZN7.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--3-01M48EJ3KC7N3TRGWYM71J13KQ.webp"
        ],
        "variantImages": {
            "Sand": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--1-01M48EJ28WN3FKQXBBPP1MD9TF.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--2-01M48EJ2FEYS5VCQ72ZNMCW274.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--sand--3-01M48EJ31RP0QMZDXJ4WJS9AAJ.webp"
            ],
            "Charcoal": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--1-01M48EJ28HP945G5KSHS6BSD3C.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--2-01M48EJ2T41JW2JPCZ1XGHBATQ.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--charcoal--3-01M48EJ38EGMJ9VYXAEZ9GP13T.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--1-01M48EJ32J9SXRKQWBDHAPZZB8.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--2-01M48EJ373GNR93K1QCQ3GVZN7.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/crewneck-sweatshirt--olive--3-01M48EJ3KC7N3TRGWYM71J13KQ.webp"
            ]
        }
    },
    "relaxed-jogger-pant": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--1-01M48EJ3XHRBG7C5CQBTGW55JP.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--1-01M48EJ3XHRBG7C5CQBTGW55JP.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--2-01M48EJ3JY6VAAMKXY7X0SP4Y1.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--3-01M48EJ451C3S2H0QDEASDYVA1.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--4-01M48EJ40467YZ0WDT0J4QVGSN.webp"
        ],
        "variantImages": {
            "Charcoal": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--1-01M48EJ3XHRBG7C5CQBTGW55JP.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--2-01M48EJ3JY6VAAMKXY7X0SP4Y1.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--3-01M48EJ451C3S2H0QDEASDYVA1.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/relaxed-jogger-pant--charcoal--4-01M48EJ40467YZ0WDT0J4QVGSN.webp"
            ]
        }
    },
    "ribbed-long-sleeve-top": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--1-01M48EJ447AKJTTN2YZ9EEAZ1X.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--1-01M48EJ447AKJTTN2YZ9EEAZ1X.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--2-01M48EJ4RKKZJTWMXS9KNN5FTK.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--3-01M48EJ4MN0E5676RPKFNJMK1S.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--1-01M48EJ57FQQKEX12H76Z8ZENY.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--2-01M48EJ4P1D5BR3SFGBSZY8GNE.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--3-01M48EJ552GPBN0AMTDHXMC88M.webp"
        ],
        "variantImages": {
            "Sand": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--1-01M48EJ447AKJTTN2YZ9EEAZ1X.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--2-01M48EJ4RKKZJTWMXS9KNN5FTK.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--sand--3-01M48EJ4MN0E5676RPKFNJMK1S.webp"
            ],
            "Charcoal": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--1-01M48EJ57FQQKEX12H76Z8ZENY.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--2-01M48EJ4P1D5BR3SFGBSZY8GNE.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-long-sleeve-top--charcoal--3-01M48EJ552GPBN0AMTDHXMC88M.webp"
            ]
        }
    },
    "minimal-tee": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--1-01M48EJ52G4GP0CX164X1AE93Y.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--1-01M48EJ52G4GP0CX164X1AE93Y.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--2-01M48EJ59GXS8RQ2RFT2SG8QJ5.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--3-01M48EJ5JXE8CMYWEQWCVWFWT9.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--4-01M48EJ5JZSMPEWFTSWJ567SCM.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--1-01M48EJ652FAF9EJT6CTEX56JH.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--2-01M48EJ6E8QDNMS9Z2E0KDSFKH.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--3-01M48EJ6548AQRB56T0YXNKKT2.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--4-01M48EJ5Z2J4FJFBHY990NAF4Z.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--1-01M48EJ6Y1WEH76R7ZNJPJRQJX.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--2-01M48EJ6YBYH1NB8MC6E71VND0.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--3-01M48EJ6Y9BZC3X653MD5E085X.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--4-01M48EJ715VE35J0QDVKZGX38B.webp"
        ],
        "variantImages": {
            "White": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--1-01M48EJ52G4GP0CX164X1AE93Y.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--2-01M48EJ59GXS8RQ2RFT2SG8QJ5.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--3-01M48EJ5JXE8CMYWEQWCVWFWT9.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--white--4-01M48EJ5JZSMPEWFTSWJ567SCM.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--1-01M48EJ652FAF9EJT6CTEX56JH.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--2-01M48EJ6E8QDNMS9Z2E0KDSFKH.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--3-01M48EJ6548AQRB56T0YXNKKT2.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--olive--4-01M48EJ5Z2J4FJFBHY990NAF4Z.webp"
            ],
            "Black": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--1-01M48EJ6Y1WEH76R7ZNJPJRQJX.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--2-01M48EJ6YBYH1NB8MC6E71VND0.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--3-01M48EJ6Y9BZC3X653MD5E085X.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/minimal-tee--black--4-01M48EJ715VE35J0QDVKZGX38B.webp"
            ]
        }
    },
    "lightweight-training-short": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--black--1-01M48EJ7AQ7GMCZTD87BKG6GJA.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--black--1-01M48EJ7AQ7GMCZTD87BKG6GJA.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--black--2-01M48EJ7AY4QMN4WRMHK50ZJJ7.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--1-01M48EJ7XHYWYVRB9V3XF75RGQ.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--2-01M48EJ7KXV8D9ZMY7MD85NNZB.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--3-01M48EJ7RJF0NN4T3GABQPKCVP.webp"
        ],
        "variantImages": {
            "Black": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--black--1-01M48EJ7AQ7GMCZTD87BKG6GJA.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--black--2-01M48EJ7AY4QMN4WRMHK50ZJJ7.webp"
            ],
            "Grey": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--1-01M48EJ7XHYWYVRB9V3XF75RGQ.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--2-01M48EJ7KXV8D9ZMY7MD85NNZB.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/lightweight-training-short--grey--3-01M48EJ7RJF0NN4T3GABQPKCVP.webp"
            ]
        }
    },
    "ribbed-sports-bra": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--1-01M48EJ7YDBSFBAHGSRJPYWJ6Q.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--1-01M48EJ7YDBSFBAHGSRJPYWJ6Q.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--2-01M48EJ8073MM5Q08A63TJHX6G.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--3-01M48EJ87FH0K49JVXNJ1SNTA1.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--4-01M48EJ8VN1B744RYKT2PT2KQY.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--1-01M48EJ8Z730FHY6AWJBJRMZ8P.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--2-01M48EJ8AHZYQDGMKQNYM7YWT1.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--3-01M48EJ8ZFWR7656ZY8R6GT7YP.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--4-01M48EJ9F1WTKXMF7VT079B9CB.webp"
        ],
        "variantImages": {
            "Sand": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--1-01M48EJ7YDBSFBAHGSRJPYWJ6Q.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--2-01M48EJ8073MM5Q08A63TJHX6G.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--3-01M48EJ87FH0K49JVXNJ1SNTA1.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--sand--4-01M48EJ8VN1B744RYKT2PT2KQY.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--1-01M48EJ8Z730FHY6AWJBJRMZ8P.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--2-01M48EJ8AHZYQDGMKQNYM7YWT1.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--3-01M48EJ8ZFWR7656ZY8R6GT7YP.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/ribbed-sports-bra--olive--4-01M48EJ9F1WTKXMF7VT079B9CB.webp"
            ]
        }
    },
    "performance-legging": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--1-01M48EJ9PK85VKM143B7P2FJ1C.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--1-01M48EJ9PK85VKM143B7P2FJ1C.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--2-01M48EJ9GYZGNWM2EMJ4J50Y4T.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--3-01M48EJA566S9K3D42A7RK50P2.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--4-01M48EJAEESZ4S5N2DA913JD5J.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--1-01M48EJA283QFC853ZF4A9PA9V.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--2-01M48EJA551JVXGVRW7MEGBTKM.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--3-01M48EJAR0JZW5DCZ2MP2MB1A2.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--4-01M48EJAF8748ABR92P9Q8WHVF.webp"
        ],
        "variantImages": {
            "Charcoal": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--1-01M48EJ9PK85VKM143B7P2FJ1C.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--2-01M48EJ9GYZGNWM2EMJ4J50Y4T.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--3-01M48EJA566S9K3D42A7RK50P2.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--charcoal--4-01M48EJAEESZ4S5N2DA913JD5J.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--1-01M48EJA283QFC853ZF4A9PA9V.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--2-01M48EJA551JVXGVRW7MEGBTKM.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--3-01M48EJAR0JZW5DCZ2MP2MB1A2.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/performance-legging--olive--4-01M48EJAF8748ABR92P9Q8WHVF.webp"
            ]
        }
    },
    "studio-zip-jacket": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--1-01M48EJAVQD3V0F8F1CWTCFPJ8.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--1-01M48EJAVQD3V0F8F1CWTCFPJ8.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--2-01M48EJARPQFWG4DRWHDJDEDHP.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--3-01M48EJBBWC07T04MSKTH4MBV7.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--4-01M48EJB2B07GD44XTCSJTZN7C.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--1-01M48EJB4Y4T54PPB1AMCYYBY4.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--2-01M48EJB8HX1W4CNHS2NGD3CE2.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--3-01M48EJC0WX2MQ0FN3X6N8N4SK.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--4-01M48EJBEHZBERE3VMC0ZQXHX0.webp"
        ],
        "variantImages": {
            "Black": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--1-01M48EJAVQD3V0F8F1CWTCFPJ8.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--2-01M48EJARPQFWG4DRWHDJDEDHP.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--3-01M48EJBBWC07T04MSKTH4MBV7.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--black--4-01M48EJB2B07GD44XTCSJTZN7C.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--1-01M48EJB4Y4T54PPB1AMCYYBY4.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--2-01M48EJB8HX1W4CNHS2NGD3CE2.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--3-01M48EJC0WX2MQ0FN3X6N8N4SK.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/studio-zip-jacket--olive--4-01M48EJBEHZBERE3VMC0ZQXHX0.webp"
            ]
        }
    },
    "movement-windbreaker": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--1-01M48EJBQ47DTPG48MEHEWFYHD.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--1-01M48EJBQ47DTPG48MEHEWFYHD.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--2-01M48EJBQK0ZS5TFZSTY1QW5R9.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--3-01M48EJBXV8GCGHTVX3R4ZQ97H.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--1-01M48EJC3FMPFX6620A903TTQD.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--2-01M48EJCGZ64DQYM0FGBTNDSSW.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--3-01M48EJCG6G76ZCE1RJVVFW3VB.webp"
        ],
        "variantImages": {
            "Sand": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--1-01M48EJBQ47DTPG48MEHEWFYHD.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--2-01M48EJBQK0ZS5TFZSTY1QW5R9.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--sand--3-01M48EJBXV8GCGHTVX3R4ZQ97H.webp"
            ],
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--1-01M48EJC3FMPFX6620A903TTQD.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--2-01M48EJCGZ64DQYM0FGBTNDSSW.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/movement-windbreaker--olive--3-01M48EJCG6G76ZCE1RJVVFW3VB.webp"
            ]
        }
    },
    "travel-hoodie": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--1-01M48EJCD3XPHG1M2Z80ZV2Z71.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--1-01M48EJCD3XPHG1M2Z80ZV2Z71.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--2-01M48EJCDCW3M1MC0VFB89J86M.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--3-01M48EJCPRE7C118YEAZZ7SQWK.webp"
        ],
        "variantImages": {
            "Off-White": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--1-01M48EJCD3XPHG1M2Z80ZV2Z71.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--2-01M48EJCDCW3M1MC0VFB89J86M.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/travel-hoodie--off-white--3-01M48EJCPRE7C118YEAZZ7SQWK.webp"
            ]
        }
    },
    "quilted-recovery-vest": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--1-01M48EJCT0E62N3WAW5D0F5JRZ.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--1-01M48EJCT0E62N3WAW5D0F5JRZ.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--2-01M48EJD5EQDRYBTJS79RCG6CT.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--3-01M48EJDPXJZ80R8GQG8BQJA8T.webp"
        ],
        "variantImages": {
            "Charcoal": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--1-01M48EJCT0E62N3WAW5D0F5JRZ.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--2-01M48EJD5EQDRYBTJS79RCG6CT.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/quilted-recovery-vest--charcoal--3-01M48EJDPXJZ80R8GQG8BQJA8T.webp"
            ]
        }
    },
    "warm-up-overshirt": {
        "thumbnail": "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--1-01M48EJD0M4C4W7XBCR12JE61S.webp",
        "images": [
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--1-01M48EJD0M4C4W7XBCR12JE61S.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--2-01M48EJD3X55BGBHTWRG83RHJK.webp",
            "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--3-01M48EJEF126YMYX9PJPVDC0RF.webp"
        ],
        "variantImages": {
            "Olive": [
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--1-01M48EJD0M4C4W7XBCR12JE61S.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--2-01M48EJD3X55BGBHTWRG83RHJK.webp",
                "https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/eded8d3c0dbc6c425a4/warm-up-overshirt--olive--3-01M48EJEF126YMYX9PJPVDC0RF.webp"
            ]
        }
    }
};

export default async function migration_25022026_replace_cdn_images({
    container,
}: {
    container: MedusaContainer;
}) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "handle",
            "thumbnail",
            "images.url",
            "variants.id",
            "variants.title",
            "variants.thumbnail",
        ],
        filters: { handle: Object.keys(PRODUCT_IMAGES) },
    });

    const productsToUpdate = products.filter(
        (product) =>
            product.thumbnail?.includes(OLD_CDN_HOST) ||
            product.images?.some((image) => image?.url.includes(OLD_CDN_HOST))
    );

    if (productsToUpdate.length === 0) {
        logger.info("No products use images from the old CDN, skipping.");
        return;
    }

    await updateProductsWorkflow(container).run({
        input: {
            products: productsToUpdate.map((product) => {
                const { thumbnail, images } = PRODUCT_IMAGES[product.handle];
                return {
                    id: product.id,
                    thumbnail,
                    images: images.map((url) => ({ url })),
                };
            }),
        },
    });

    const { data: updatedProducts } = await query.graph({
        entity: "product",
        fields: ["id", "images.id", "images.url"],
        filters: { id: productsToUpdate.map((product) => product.id) },
    });

    const imageIdsByProduct = new Map(
        updatedProducts.map((product) => [
            product.id,
            new Map((product.images ?? []).map((image) => [image?.url, image?.id])),
        ])
    );

    const variantThumbnails: { id: string; thumbnail: string }[] = [];

    for (const product of productsToUpdate) {
        const { thumbnail, variantImages } = PRODUCT_IMAGES[product.handle];
        const imageIds = imageIdsByProduct.get(product.id);

        for (const variant of product.variants ?? []) {
            if (!variant) {
                continue;
            }
            const color = variant.title?.match(/\/ ([A-Za-z-]+)$/)?.[1];
            const colorUrls = (color && variantImages?.[color]) || [];
            const colorImageIds = colorUrls
                .map((url) => imageIds?.get(url))
                .filter((id): id is string => !!id);

            if (colorImageIds.length > 0) {
                await batchVariantImagesWorkflow(container).run({
                    input: { variant_id: variant.id, add: colorImageIds, remove: [] },
                });
            }

            if (variant.thumbnail?.includes(OLD_CDN_HOST)) {
                variantThumbnails.push({
                    id: variant.id,
                    thumbnail: colorUrls[0] ?? thumbnail,
                });
            }
        }
    }

    if (variantThumbnails.length > 0) {
        await updateProductVariantsWorkflow(container).run({
            input: { product_variants: variantThumbnails },
        });
    }

    logger.info(`Replaced old CDN images of ${productsToUpdate.length} products.`);
}
