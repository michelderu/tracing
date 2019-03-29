# Tracing demo
Show end to end traceability through provenance and lineage using the PROV Ontology.

The application uses:
- MarkLogic 9.0-8.2 (http://developer.marklogic.com/)
- Data Hub Framework 4.2.2 (https://marklogic.github.io/marklogic-data-hub/)
- Grove (https://marklogic-community.github.io/grove/)

More information on PROV-O can be found here: https://www.w3.org/TR/prov-o/

## Get started
Startup a clean MarkLogic Docker container

`docker run -d --name=tracing-demo -p 8000-8020:8000-8020 marklogic:9.0-8.2`

Run the Data Hub

`java -jar quick-start-4.2.2.war`

Deploy the hub

`gradle mlDeploy`

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
```
select * from customer
limit 10
```

## Start over again
Clear the STAGING and FINAL content dabases: DHF -> Browse data -> Kill icon

Now reinstall the entities and templates:
`gradle mlLoadModules`

## Demo flow
### Prerequisites
1. Start DHF and UI
### Explain the context
2. Tell the story about the M&A and the resulting 2 CRM systems
3. Show the source data as an example
3. Explain the need from the Marketing department (1 single 360 view of all customers)
4. Explain Turn Key Data Integration using DHF
### Start the turn-key Data Integration with the end in mind (the 360 view of customer)
5. Show the 360 view of the Customer entity
6. Ingest the data
### Show the immediate value for business and analysts
7. Search through the STAGING db
### Create source-to-target mapping directly with the business
8. Show the mapping, explain that it generates all code allowing us to only change one line
9. Run the harmonization
### Show the immediate results and value of the data that turned into information
10. Search through the FINAL db
### Show the provenance and lineage information in the DHF
11. SHow the Jobs and Traces panes
### Show the end-to-end tracing using the Graph view
12. Show the Tracing GUI with ingest and harmonization activities
### Call a data service for end-to-end tracing information allowing for accountability and compliancy
13. Explain end-to-end lineage
14. Call the Data Services interface for Customer data (enabling a Data Driven organization and easy innovation)
15. Show the Tracing GUI with the GetCustomer activity
### Now also show how to leverage existing knowledge in the organisation
16. Show the possibility to leverage existing SQL knowledge within the organization using the Query Console
