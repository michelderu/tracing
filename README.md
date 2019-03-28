# Tracing demo
Show end to end provenance and lineage

## Get started
Startup a clean MarkLogic Docker container
```
docker run -d --name=tracing-demo -p 8000-8020:8000-8020 marklogic:9.0-8.2
```
Run the Data Hub
```
java -jar quick-start-4.2.2.war
```
Deploy the hub
````
gradle mlDeploy
```
Deploy and start the UI
```
cd gui/marklogic
gradle mlDeploy
cd ..
npm install
npm start
```

## Load and harmonize the data (while tracking provenance and lineage) / Or use the Data Hub Quick Start
Ingest Dynamics and Salesforce data
`gradle ingestAll`
Harmonize all data to Customer 360 view
`gradle harmonizeAll`

## Retrieve data (while tracking usage)
Retrieve customers through the data service
`http://localhost:8011/v1/resources/customer?rs:name=Hans`

## Retrieve data through SQL
Go to Query Console
`http://localhost:8000`
Select data-hub-FINAL
Run SQL:
`select * from customer`
`limit 10`

## Demo flow
1. Start DHF and UI
2. Tell the story about the M&A and the resulting 2 CRM systems
3. Show the source data as an example
3. Explain the need from the Marketing department (1 single 360 view of all customers)
4. Explain Turn Key Data Integration using DHF
5. Show the 360 view of the Customer entity
6. Ingest the data
7. Search through the STAGING db
8. Show the mapping, explain that it generates all code allowing us to only change one line
9. Run the harmonization
10. Search through the FINAL db
11. Show the Tracing GUI with ingest and harmonization activities
12. Explain end-to-end lineage
13. Call the Data Services interface for Customer data (enabling a Data Driven organization and easy innovation)
14. Show the Tracing GUI with the GetCustomer activity
15. Show the possibility to leverage existing SQL knowledge within the organization using the Query Console
