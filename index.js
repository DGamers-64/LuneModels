function createValidator(type) {
    const rules = []

    const api = {
        validate(value) {
            if (type === "string" && typeof value !== "string") return "Debe ser un string"
            if (type === "number" && typeof value !== "number") return "Debe ser un número"

            for (const rule of rules) {
                const result = rule(value)
                if (result !== true) return result
            }

            return true
        },

        maxLength(limit, message = `Máximo ${limit}`) {
            rules.push((value) => {
                if (value.length > limit) return message
                return true
            })
            return api
        },

        minLength(limit, message = `Mínimo ${limit}`) {
            rules.push((value) => {
                if (value.length < limit) return message
                return true
            })
            return api
        },

        max(limit, message = `Máximo ${limit}`) {
            rules.push((value) => {
                if (value > limit) return message
                return true
            })
            return api
        },

        min(limit, message = `Mínimo ${limit}`) {
            rules.push((value) => {
                if (value < limit) return message
                return true
            })
            return api
        },

        required(message = "Campo requerido") {
            rules.unshift((value) => {
                if (value === undefined || value === null) {
                    return message
                }
                return true
            })
            return api
        }
    }

    return api
}

function createSchema(definition) {
    return {
        validate(data) {
            const errors = {}
            const value = {}

            for (const key in definition) {
                const validator = definition[key]
                const result = validator.validate(data[key])

                if (result !== true) {
                    errors[key] = result
                } else {
                    value[key] = data[key]
                }
            }

            return {
                valid: Object.keys(errors).length === 0,
                errors,
                value
            }
        }
    }
}

const LuneModels = {
    string() {
        return createValidator("string")
    },

    number() {
        return createValidator("number")
    },

    schema(definition) {
        return createSchema(definition)
    }
}

export default LuneModels