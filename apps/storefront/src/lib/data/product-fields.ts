export const PRODUCT_LIST_FIELDS =
  '*variants.calculated_price,+variants.inventory_quantity,*variants.options,*attribute_values,*attribute_values.attribute';

export const PRODUCT_DETAIL_FIELDS = `${PRODUCT_LIST_FIELDS},*categories,*categories.parent_category`;
