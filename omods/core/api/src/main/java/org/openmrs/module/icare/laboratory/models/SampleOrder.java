package org.openmrs.module.icare.laboratory.models;

// Generated Oct 7, 2020 12:48:40 PM by Hibernate Tools 5.2.10.Final

import org.apache.xpath.operations.Bool;
import org.openmrs.Order;
import org.openmrs.User;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LbSampleOrder generated by hbm2java
 */
@Entity
@Table(name = "lb_sample_order")
public class SampleOrder implements Serializable {
	
	@EmbeddedId
	private SampleOrderID id;
	
	@ManyToOne
	@JoinColumn(name = "technician")
	private User technician;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "sampleOrder")
	private List<TestAllocation> testAllocations = new ArrayList<TestAllocation>(0);
	
	public User getTechnician() {
		return technician;
	}
	
	public void setTechnician(User technician) {
		this.technician = technician;
	}
	
	public SampleOrderID getId() {
		return id;
	}
	
	public void setId(SampleOrderID id) {
		this.id = id;
	}
	
	public void setOrder(Order order) {
		if (id == null) {
			this.id = new SampleOrderID();
		}
		this.id.setOrder(order);
	}
	
	public void setSample(Sample sample) {
		if (id == null) {
			this.id = new SampleOrderID();
		}
		this.id.setSample(sample);
	}
	
	public Order getOrder() {
		return id.getOrder();
	}
	
	public Sample getSample() {
		return id.getSample();
	}
	
	public static SampleOrder fromMap(Map<String, Object> map) {
		SampleOrder sampleOrder = new SampleOrder();
		
		Order order = new Order();
		order.setUuid(((Map) map.get("order")).get("uuid").toString());
		sampleOrder.setOrder(order);
		
		Sample sample = new Sample();
		sample.setUuid(((Map) map.get("sample")).get("uuid").toString());
		sampleOrder.setSample(sample);
		
		if (map.get("technician") != null) {
			User user = new User();
			user.setUuid(((Map) map.get("technician")).get("uuid").toString());
			sampleOrder.setTechnician(user);
		}
		return sampleOrder;
	}
	
	public Map<String, Object> toMap(Boolean excludeAllocations) {
		Map<String, Object> sampleOrderObject = new HashMap<String, Object>();
		
		Map<String, Object> technicianObject = new HashMap<String, Object>();
		
		if (this.getTechnician() != null) {
			
			technicianObject.put("uuid", this.getTechnician().getUuid());
			technicianObject.put("display", this.getTechnician().getDisplayString());
			
			sampleOrderObject.put("technician", technicianObject);
		}
		
		Map<String, Object> sampleObject = new HashMap<String, Object>();
		sampleObject.put("uuid", this.getSample().getUuid());
		sampleObject.put("label", this.getSample().getLabel());
		
		sampleOrderObject.put("sample", sampleObject);
		
		Map<String, Object> orderObject = new HashMap<String, Object>();
		orderObject.put("uuid", this.getOrder().getUuid());
		orderObject.put("orderNumber", this.getOrder().getOrderNumber());
		orderObject.put("voided", this.getOrder().getVoided());
		orderObject.put("voidReason", this.getOrder().getVoidReason());
		
		Map<String, Object> ordererObject = new HashMap<String, Object>();
		ordererObject.put("uuid", this.getOrder().getOrderer().getUuid());
		ordererObject.put("name", this.getOrder().getOrderer().getName());
		orderObject.put("voided", this.getOrder().getVoided());
		orderObject.put("voidReason", this.getOrder().getVoidReason());
		orderObject.put("orderer", ordererObject);
		
		Map<String, Object> conceptObject = new HashMap<String, Object>();
		conceptObject.put("uuid", this.getOrder().getConcept().getUuid());
		conceptObject.put("display", getOrder().getConcept().getDisplayString());
		orderObject.put("concept", conceptObject);
		
		sampleOrderObject.put("order", orderObject);
		if(excludeAllocations) {
			List<Map<String, Object>> testAllocationObject = new ArrayList<Map<String, Object>>();
			for (TestAllocation testAllocation : this.getTestAllocations()) {
				testAllocationObject.add(testAllocation.toMap());
			}
			sampleOrderObject.put("testAllocations", testAllocationObject);
		}
		return sampleOrderObject;
	}
	
	public List<TestAllocation> getTestAllocations() {
		return testAllocations;
	}
	
	public void setTestAllocations(List<TestAllocation> testAllocations) {
		this.testAllocations = testAllocations;
	}
}
