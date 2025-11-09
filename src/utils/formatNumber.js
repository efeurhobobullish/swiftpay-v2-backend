const formatNumber = (number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(number);
};

export default formatNumber;