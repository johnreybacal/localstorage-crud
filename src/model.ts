import InstanceMethods from "./instanceMethods";
import LocalStorageDb from "./localStorageDb";
import ModelManager from "./modelManager";
import ModelSettings from "./modelSettings";
import Schema from "./schema";
import Schemas from "./schemas";

export default class Model<T extends Schema> {
    modelName: string;
    private localStorageDb: LocalStorageDb<T>;
    private modelSettings: ModelSettings;
    private instanceMethods: InstanceMethods<T>;

    /**
     * Create a new model
     */
    constructor(modelName: string, modelSettings?: ModelSettings) {
        this.modelName = modelName;
        this.localStorageDb = new LocalStorageDb<T>(this.modelName);

        ModelManager.addModel(this, this.localStorageDb);

        this.modelSettings = modelSettings ?? {
            timestamps: false,
            softDelete: false,
        };

        this.instanceMethods = new InstanceMethods<T>(
            this.localStorageDb,
            this.modelSettings
        );
    }

    /**
     * Creates a new instance of the model
     */
    build(instance?: Omit<T, keyof Schema>): T;

    /**
     * Creates a list of instances of the model
     */
    build(instances: Omit<T, keyof Schema>[]): Schemas<T>;

    /**
     * Overloading implementation
     */
    build(
        params?: Omit<T, keyof Schema> | Omit<T, keyof Schema>[]
    ): T | Schemas<T> {
        if (params && Array.isArray(params)) {
            const builtInstances: Schemas<T> = new Schemas<T>(
                this.instanceMethods
            );

            params.forEach((param) => {
                builtInstances.push(this.instanceMethods.build(param));
            });

            return builtInstances;
        } else {
            return this.instanceMethods.build(params as Omit<T, keyof Schema>);
        }
    }

    /**
     * Fetches all records in the model
     * @returns array of records
     */
    list() {
        return this.build(this.localStorageDb.list());
    }

    find(filter: Partial<T>) {
        return this.build(this.localStorageDb.find(filter));
    }

    findOne(filter: Partial<T>) {
        const filtered = this.localStorageDb.find(filter, true);
        if (filtered.length > 0) {
            return this.build(filtered[0]);
        } else {
            return null;
        }
    }

    /**
     * Fetch a specific record based on ID
     * @param id ID of the record
     * @returns specific record
     */
    findById = (id: string) => this.get(id);

    /**
     * Fetch a specific record based on ID
     * @param id ID of the record
     * @returns specific record
     */
    get(id: string) {
        const record = this.localStorageDb.get(id);
        if (record) {
            return this.build(this.localStorageDb.get(id));
        } else {
            return null;
        }
    }

    /**
     * Create a new record in the model
     * @param record record to create
     * @returns record created
     */
    create(record: Omit<T, keyof Schema>): T;

    /**
     * Bulk insert a list of records
     * @param records list to bulk create
     * @returns records created
     */
    create(records: Omit<T, keyof Schema>[]): Schemas<T>;

    /**
     * Overloading implementation
     */
    create(
        param: Omit<T, keyof Schema> | Omit<T, keyof Schema>[]
    ): T | Schemas<T> {
        if (Array.isArray(param)) {
            const instanceRecords = param as T[];
            instanceRecords.forEach((record) => {
                record.id = crypto.randomUUID();
                this.setCreateTimestamp(record);
            });
            return this.build(this.localStorageDb.bulkCreate(instanceRecords));
        } else {
            const instanceRecord = param as T;
            this.setCreateTimestamp(instanceRecord);
            instanceRecord.id = crypto.randomUUID();

            return this.build(this.localStorageDb.create(instanceRecord));
        }
    }

    /**
     * Update an existing record based on ID
     * @param id ID of the record
     * @param record record to update
     * @returns record updated
     */
    update(id: string, record: Partial<Omit<T, keyof Schema>>) {
        this.setUpdateTimestamp(record as T);
        const updatedData = this.localStorageDb.update(id, record as T);

        if (updatedData) {
            return this.build(updatedData);
        }

        return null;
    }

    /**
     * Delete a record based on ID
     * @param id ID of the record
     */
    delete(id: string) {
        if (this.modelSettings.softDelete) {
            return this.localStorageDb.softDelete(id);
        } else {
            return this.localStorageDb.delete(id);
        }
    }

    /**
     * Deletes all records in the model
     */
    truncate() {
        this.localStorageDb.truncate();
    }

    private setCreateTimestamp(record: T) {
        if (this.modelSettings.timestamps) {
            record.createdAt = new Date();
        }
    }
    private setUpdateTimestamp(record: T) {
        if (this.modelSettings.timestamps) {
            record.updatedAt = new Date();
        }
    }
}
