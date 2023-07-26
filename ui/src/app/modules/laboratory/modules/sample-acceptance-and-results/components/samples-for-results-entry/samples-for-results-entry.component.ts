import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";
import { AppState } from "src/app/store/reducers";
import { getProviderDetails } from "src/app/store/selectors/current-user.selectors";
import { SharedResultsEntryAndViewModalComponent } from "../shared-results-entry-and-view-modal/shared-results-entry-and-view-modal.component";
import { map } from "rxjs/operators";
import { groupBy } from "lodash";
import { LabSample } from "src/app/modules/laboratory/resources/models";

@Component({
  selector: "app-samples-for-results-entry",
  templateUrl: "./samples-for-results-entry.component.html",
  styleUrls: ["./samples-for-results-entry.component.scss"],
})
export class SamplesForResultsEntryComponent implements OnInit {
  @Input() codedSampleRejectionReasons: any;
  @Input() labConfigs: any;
  @Input() datesParameters: any;
  @Input() patients: any[];
  @Input() sampleTypes: any;
  @Input() labSamplesDepartments: any;
  @Input() labSamplesContainers: any;
  @Input() currentUser: any;
  @Input() LISConfigurations: any;
  @Input() userUuid: string;
  @Input() category: string;
  @Input() hasStatus: string;
  @Input() viewType: string;

  sampplesForResultsEntry$: Observable<any[]>;
  selectedDepartment: string;
  searchingText: string;
  excludeAllocations: boolean = true;

  page: number = 1;
  pageCount: number = 100;

  savingMessage: any = {};
  providerDetails$: Observable<any>;

  samplesToViewMoreDetails: any = {};
  saving: boolean = false;
  selectedResultEntryCategory: string = "Normal";

  dataForPrinting: any;
  @Output() dataToPrint: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private store: Store<AppState>,
    private sampleService: SamplesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.providerDetails$ = this.store.select(getProviderDetails);
  }

  getSelectedResultEntryCategory(event: MatRadioChange): void {
    this.selectedResultEntryCategory = event?.value;
  }

  getSamples(): void {
    this.sampplesForResultsEntry$ =
      this.sampleService.getLabSamplesByCollectionDates(
        this.datesParameters,
        "ACCEPTED",
        "YES",
        this.excludeAllocations,
        null,
        {
          departments: this.labSamplesDepartments,
          specimenSources: this.sampleTypes,
          codedRejectionReasons: this.codedSampleRejectionReasons,
        }
      );
  }

  onResultsEntryAndReview(
    sample: any,
    providerDetails: any,
    actionType: string
  ): void {
    this.dialog
      .open(SharedResultsEntryAndViewModalComponent, {
        data: {
          sample: sample,
          currentUser: this.currentUser,
          labConfigs: this.labConfigs,
          LISConfigurations: this.LISConfigurations,
          actionType,
        },
        width: "100%",
        disableClose: false,
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .subscribe((changed: boolean) => {
        if (changed) {
          this.providerDetails$ = of(null);
          setTimeout(() => {
            this.providerDetails$ = this.store.select(getProviderDetails);
          }, 50);
        }
      });
  }

  onGetSelectedSampleDetails(sample: any, providerDetails: any): void {
    this.sampleService
      .getFormattedSampleByUuid(
        sample?.uuid,
        this.labSamplesDepartments,
        this.sampleTypes,
        this.codedSampleRejectionReasons
      )
      .pipe(
        map((response) => {
          const filteredCompletedSamples = [
            {
              ...response,
              mrn: response?.mrn,
              departmentName: response?.department?.name,
            },
          ];
          const groupedByMRN = groupBy(filteredCompletedSamples, "mrn");
          return Object.keys(groupedByMRN).map((key) => {
            const samplesKeyedByDepartments = groupBy(
              groupedByMRN[key],
              "departmentName"
            );
            return {
              mrn: key,
              patient: groupedByMRN[key][0]?.sample?.patient,
              departments: Object.keys(samplesKeyedByDepartments).map(
                (depName) => {
                  return {
                    departmentName: depName,
                    samples: samplesKeyedByDepartments[depName].map(
                      (sampleObject) => {
                        const sample = new LabSample(
                          sampleObject,
                          this.labSamplesDepartments,
                          this.sampleTypes,
                          this.codedSampleRejectionReasons
                        ).toJSon();
                        return sample;
                      }
                    ),
                  };
                }
              ),
            };
          });
        })
      )
      .subscribe((response) => {
        this.dataForPrinting = {
          patientDetailsAndSamples: response[0],
          labConfigs: this.labConfigs,
          LISConfigurations: this.LISConfigurations,
          user: providerDetails,
          authorized: true,
        };
        this.dataToPrint.emit(this.dataForPrinting);
      });
  }
}
