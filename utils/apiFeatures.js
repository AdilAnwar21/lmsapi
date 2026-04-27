class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        
        // 1. Base64 Interceptor Logic
        let parsedQuery = { ...queryString };

        if (queryString.q) {
            try {
                // Decode from Base64
                const decodedString = Buffer.from(queryString.q, 'base64').toString('utf-8');
                // Parse the JSON object
                const decodedJSON = JSON.parse(decodedString);
                
                // Merge decoded JSON with any other standard params, and remove 'q'
                parsedQuery = { ...parsedQuery, ...decodedJSON };
                delete parsedQuery.q;
            } catch (error) {
                console.error('Invalid Base64 or JSON in query string:', error.message);
                // If decoding fails, we just ignore it and use standard params
            }
        }

        this.queryString = parsedQuery;
    }

    // 2. ADVANCED FILTERING
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // 3. SEARCHING
    search(searchFields = ['name']) {
        if (this.queryString.search) {
            const searchRegex = new RegExp(this.queryString.search, 'i');
            
            const searchConditions = searchFields.map(field => ({
                [field]: searchRegex
            }));

            this.query = this.query.find({ $or: searchConditions });
        }
        return this;
    }

    // 4. SORTING
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    // 5. PAGINATION
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;